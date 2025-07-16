import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { rateLimit, getClientIP, validateInput, sanitizeOutput, logSecurityEvent } from '../../../lib/security';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const prisma = new PrismaClient();

// Helper para formatear CLP
const clp = (n: number) => 'CLP ' + n.toLocaleString('es-CL');

export async function POST(request: Request) {
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(30, 60 * 1000, `post_enhanced_${clientIP}`);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { method: 'POST', endpoint: 'predict-enhanced' }, clientIP);
      return NextResponse.json(
        { 
          error: 'Demasiadas solicitudes. Intenta nuevamente en un minuto.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      );
    }
    
    const body = await request.json();
    
    // Validación de entrada
    const validation = validateInput(body);
    if (!validation.isValid) {
      logSecurityEvent('INVALID_INPUT', { errors: validation.errors, input: body }, clientIP);
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          details: validation.errors
        },
        { status: 400 }
      );
    }
    
    const { comuna, m2, estacionamientos, bodega, tipoPropiedad, dormitorios } = validation.data;
    
    if (!comuna || !m2) {
      return NextResponse.json(
        { error: 'Comuna y metros cuadrados son requeridos' },
        { status: 400 }
      );
    }

    // Preparar datos para predicción básica
    const targetProperty = {
      comuna,
      m2: parseInt(m2.toString()),
      tipoPropiedad,
      dormitorios: parseInt(dormitorios.toString()),
      estacionamientos: parseInt(estacionamientos.toString()),
      bodega: bodega === true || bodega === 'true'
    };
    
    console.log('🎯 Predicción enhanced para:', targetProperty);
    
    // Buscar listings similares
    const listings = await prisma.listing.findMany({
      where: {
        comuna: comuna,
        status: 'active'
      },
      select: {
        precio: true,
        m2: true,
        tipoPropiedad: true,
        dormitorios: true,
        estacionamientos: true,
        bodega: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    if (listings.length === 0) {
      return NextResponse.json(
        { error: `No se encontraron propiedades en ${comuna}` },
        { status: 404 }
      );
    }

    // Filtrar por tipo de propiedad
    let filteredListings = listings.filter(l => l.tipoPropiedad === tipoPropiedad);
    
    if (filteredListings.length < 10) {
      filteredListings = listings;
    }

    // Calcular precios ajustados
    const rents = filteredListings.map(listing => {
      const pricePerM2 = listing.precio / listing.m2;
      const basePrice = pricePerM2 * targetProperty.m2;
      
      // Ajustes
      const estacionamientoDiff = targetProperty.estacionamientos - listing.estacionamientos;
      const bodegaDiff = targetProperty.bodega && !listing.bodega ? 1 : (!targetProperty.bodega && listing.bodega ? -1 : 0);
      const dormitoriosDiff = targetProperty.dormitorios - listing.dormitorios;
      
      const estacionamientoFactor = estacionamientoDiff * 0.12;
      const bodegaFactor = bodegaDiff * 0.08;
      const dormitoriosFactor = dormitoriosDiff * 0.15;
      
      const adjustedPrice = basePrice * (1 + estacionamientoFactor + bodegaFactor + dormitoriosFactor);
      
      return Math.round(adjustedPrice);
    });

    rents.sort((a, b) => a - b);
    
    // Calcular percentiles
    const p = (q: number) => rents[Math.floor((rents.length - 1) * q)];
    const p10 = p(0.10);
    const p25 = p(0.25);
    const p50 = p(0.50);
    const p75 = p(0.75);
    const p90 = p(0.90);

    const predicted_price = p50;
    
    // Calcular confianza
    const avg = rents.reduce((sum, r) => sum + r, 0) / rents.length;
    const variance = rents.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / rents.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avg;
    
    const confidence = Math.max(20, Math.min(95, 100 - (cv * 100)));
    const market_condition = cv < 0.2 ? 'estable' : cv < 0.4 ? 'moderado' : 'volátil';

    const responseData = {
      predicted_price: Math.round(predicted_price),
      sample_size: filteredListings.length,
      confidence: Math.round(confidence),
      percentiles: {
        p10: Math.round(p10),
        p25: Math.round(p25),
        p50: Math.round(p50),
        p75: Math.round(p75),
        p90: Math.round(p90)
      },
      market_condition,
      comuna,
      m2: targetProperty.m2,
      tipoPropiedad,
      dormitorios: targetProperty.dormitorios,
      estacionamientos: targetProperty.estacionamientos,
      bodega: targetProperty.bodega,
      dataQuality: {
        sampleSize: filteredListings.length,
        modelVersion: '2.0',
        algorithm: 'enhanced_basic',
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    };

    console.log('✅ Predicción enhanced completada:', {
      predicted_price: responseData.predicted_price,
      confidence: responseData.confidence,
      sample_size: responseData.sample_size
    });

    return NextResponse.json(sanitizeOutput(responseData), {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-Model-Version': '2.0',
        'X-Confidence': responseData.confidence.toString(),
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    });
    
  } catch (error) {
    console.error('❌ Error en predicción enhanced:', error);
    
    logSecurityEvent('ENHANCED_PREDICTION_ERROR', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, clientIP);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la predicción enhanced',
        details: error instanceof Error ? error.message : 'Error desconocido',
        modelVersion: '2.0'
      },
      { status: 500 }
    );
  }
}