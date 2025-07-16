import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { rateLimit, getClientIP, validateInput, sanitizeOutput, logSecurityEvent } from '../../../lib/security';

const prisma = new PrismaClient();

// Helper para formatear CLP
const clp = (n: number) => 'CLP ' + n.toLocaleString('es-CL');

export async function POST(request: Request) {
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(30, 60 * 1000, `post_${clientIP}`);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { method: 'POST', limit: 30 }, clientIP);
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

    // Solo usar publicaciones ACTIVAS y RECIENTES para estimaciones precisas
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const listings = await prisma.listing.findMany({
      where: {
        comuna: {
          equals: comuna,
        },
        status: 'active', // Solo publicaciones activas
        publishedAt: {
          gte: oneYearAgo // Máximo 1 año de antigüedad
        }
      },
      select: {
        precio: true,
        m2: true,
        tipoPropiedad: true,
        dormitorios: true,
        estacionamientos: true,
        bodega: true,
        publishedAt: true,
        sourceUrl: true
      },
      orderBy: {
        publishedAt: 'desc' // Priorizar las más recientes
      }
    });

    if (listings.length === 0) {
      return NextResponse.json(
        { 
          error: 'No se encontraron publicaciones activas y recientes para esta comuna',
          comuna,
          suggestion: 'Intente con otra comuna o verifique que haya propiedades disponibles',
          filters: 'Solo se consideran publicaciones activas de máximo 1 año de antigüedad'
        },
        { status: 404 }
      );
    }

    // NUEVO MODELO DE PREDICCIÓN: Filtrar por características específicas PRIMERO
    
    console.log(`🎯 Buscando propiedades: ${tipoPropiedad}, ${dormitorios} dormitorios en ${comuna}`);
    
    // PASO 1: Filtrar por tipo de propiedad EXACTO
    let filteredListings = listings.filter(l => l.tipoPropiedad === tipoPropiedad);
    console.log(`📊 Propiedades del tipo ${tipoPropiedad}: ${filteredListings.length}`);
    
    // PASO 2: Si hay suficientes, filtrar también por dormitorios similares (±1)
    const dormitoriosNum = parseInt(dormitorios.toString());
    const dormitoriosFiltrados = filteredListings.filter(l => 
      Math.abs(l.dormitorios - dormitoriosNum) <= 1
    );
    
    console.log(`🛏️ Con ${dormitoriosNum}±1 dormitorios: ${dormitoriosFiltrados.length}`);
    
    // Si tenemos suficientes con dormitorios similares, usar esos
    if (dormitoriosFiltrados.length >= 20) {
      filteredListings = dormitoriosFiltrados;
      console.log(`✅ Usando listings con dormitorios similares`);
    } else if (filteredListings.length >= 30) {
      console.log(`⚠️ Pocos con dormitorios exactos, usando todos del tipo ${tipoPropiedad}`);
    } else {
      // Si no hay suficientes del tipo exacto, expandir gradualmente
      console.log(`❌ Muy pocos del tipo ${tipoPropiedad}, expandiendo búsqueda...`);
      
      // Agregar el tipo opuesto con penalización fuerte
      const otherType = tipoPropiedad === 'casa' ? 'departamento' : 'casa';
      const otherTypeListings = listings.filter(l => l.tipoPropiedad === otherType);
      
      // Aplicar factor de conversión fuerte entre tipos
      const conversionFactor = tipoPropiedad === 'casa' ? 1.8 : 0.55; // Casa +80%, Depto -45%
      
      filteredListings = [
        ...filteredListings,
        ...otherTypeListings.map(listing => ({
          ...listing,
          precio: Math.round(listing.precio * conversionFactor)
        }))
      ];
      
      console.log(`🔄 Expandido con ${otherTypeListings.length} propiedades convertidas (factor ${conversionFactor})`);
    }
    
    console.log(`📈 Total listings para análisis: ${filteredListings.length}`);
    
    if (filteredListings.length === 0) {
      return NextResponse.json(
        { 
          error: `No se encontraron propiedades similares de tipo ${tipoPropiedad} en ${comuna}`,
          suggestion: 'Intente con otro tipo de propiedad o comuna'
        },
        { status: 404 }
      );
    }
    
    // PASO 3: Calcular precios con ajustes menores por características específicas
    const rents = filteredListings.map((listing: { precio: number; m2: number; tipoPropiedad: string; dormitorios: number; estacionamientos: number; bodega: boolean }) => {
      // Precio base por m2
      const pricePerM2 = listing.precio / listing.m2;
      const basePrice = pricePerM2 * m2;
      
      // Ajustes finos por características específicas
      const estacionamientoDiff = estacionamientos - listing.estacionamientos;
      const bodegaDiff = bodega && !listing.bodega ? 1 : (!bodega && listing.bodega ? -1 : 0);
      const dormitoriosDiff = dormitorios - listing.dormitorios;
      
      // Factores de ajuste más pronunciados
      const estacionamientoFactor = estacionamientoDiff * 0.12; // 12% por estacionamiento
      const bodegaFactor = bodegaDiff * 0.08; // 8% por bodega  
      const dormitoriosFactor = dormitoriosDiff * 0.15; // 15% por dormitorio adicional
      
      const adjustedPrice = basePrice * (1 + estacionamientoFactor + bodegaFactor + dormitoriosFactor);
      
      // Log de ajustes significativos
      if (Math.abs(estacionamientoDiff) > 0 || bodegaDiff !== 0 || Math.abs(dormitoriosDiff) > 0) {
        console.log(`🔧 Ajuste fino: ${listing.tipoPropiedad} ${listing.dormitorios}D -> ${dormitorios}D, Est:${listing.estacionamientos}->${estacionamientos}, Bodega:${listing.bodega}->${bodega}, Precio: ${Math.round(basePrice)} -> ${Math.round(adjustedPrice)}`);
      }
      
      return Math.round(adjustedPrice);
    });
    
    rents.sort((a: number, b: number) => a - b);
    const p = (q: number) => rents[Math.floor((rents.length - 1) * q)];
    const p25 = p(0.25);
    const p50 = p(0.50);
    const p75 = p(0.75);
    const min = rents[0];
    const max = rents[rents.length - 1];
    const avg = Math.round(rents.reduce((s: number, r: number) => s + r, 0) / rents.length);

    const responseData = {
      min, max, avg, p25, p50, p75,
      minFmt: clp(min),
      maxFmt: clp(max),
      avgFmt: clp(avg),
      p25Fmt: clp(p25),
      p50Fmt: clp(p50),
      p75Fmt: clp(p75),
      count: rents.length,
      comuna,
      m2,
      tipoPropiedad,
      dormitorios,
      dataQuality: {
        allActive: true,
        maxAge: '1 año',
        lastUpdated: new Date().toISOString().split('T')[0],
        sources: [...new Set(listings.map(l => l.sourceUrl).filter(Boolean))].length
      }
    };
    
    // Sanitizar salida
    const sanitizedResponse = sanitizeOutput(responseData);
    
    // Log de éxito
    logSecurityEvent('PREDICTION_SUCCESS', { comuna, m2, count: rents.length }, clientIP);
    
    return NextResponse.json(sanitizedResponse, {
      headers: {
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    });
  } catch (error) {
    console.error('❌ Error en la predicción:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// GET para compatibilidad con curl de vercel
export async function GET(request: Request) {
  const clientIP = getClientIP(request);
  
  try {
    console.log('🔍 GET /api/predict - Request received');
    console.log('🌐 Full URL:', request.url);
    
    // Rate limiting
    const rateLimitResult = rateLimit(60, 60 * 1000, `get_${clientIP}`);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { method: 'GET', limit: 60 }, clientIP);
      return NextResponse.json(
        { 
          error: 'Demasiadas solicitudes. Intenta nuevamente en un minuto.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const rawParams = {
      comuna: searchParams.get('comuna'),
      m2: searchParams.get('m2') ? Number(searchParams.get('m2')) : undefined,
      estacionamientos: searchParams.get('estacionamientos') ? Number(searchParams.get('estacionamientos')) : 0,
      bodega: searchParams.get('bodega') === 'true',
      tipoPropiedad: searchParams.get('tipoPropiedad') || 'departamento',
      dormitorios: searchParams.get('dormitorios') ? Number(searchParams.get('dormitorios')) : 2
    };
    
    // Validación de entrada
    const validation = validateInput(rawParams);
    if (!validation.isValid) {
      logSecurityEvent('INVALID_INPUT', { errors: validation.errors, input: rawParams }, clientIP);
      return NextResponse.json(
        { 
          error: 'Parámetros de entrada inválidos',
          details: validation.errors
        },
        { status: 400 }
      );
    }
    
    const { comuna, m2, estacionamientos, bodega, tipoPropiedad, dormitorios } = validation.data;
    
    console.log('📝 Parámetros validados:', { comuna, m2, estacionamientos, bodega, tipoPropiedad, dormitorios });
    if (!comuna || !m2) {
      return NextResponse.json(
        { error: 'Comuna y metros cuadrados son requeridos' },
        { status: 400 }
      );
    }
    // Solo usar publicaciones ACTIVAS y RECIENTES para estimaciones precisas
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const listings = await prisma.listing.findMany({
      where: {
        comuna: {
          equals: comuna,
        },
        status: 'active', // Solo publicaciones activas
        publishedAt: {
          gte: oneYearAgo // Máximo 1 año de antigüedad
        }
      },
      select: {
        precio: true,
        m2: true,
        tipoPropiedad: true,
        dormitorios: true,
        estacionamientos: true,
        bodega: true,
        publishedAt: true,
        sourceUrl: true
      },
      orderBy: {
        publishedAt: 'desc' // Priorizar las más recientes
      }
    });
    if (listings.length === 0) {
      return NextResponse.json(
        { 
          error: 'No se encontraron publicaciones activas y recientes para esta comuna',
          comuna,
          suggestion: 'Intente con otra comuna o verifique que haya propiedades disponibles',
          filters: 'Solo se consideran publicaciones activas de máximo 1 año de antigüedad'
        },
        { status: 404 }
      );
    }
    // NUEVO MODELO DE PREDICCIÓN: Filtrar por características específicas PRIMERO
    
    console.log(`🎯 Buscando propiedades: ${tipoPropiedad}, ${dormitorios} dormitorios en ${comuna}`);
    
    // PASO 1: Filtrar por tipo de propiedad EXACTO
    let filteredListings = listings.filter(l => l.tipoPropiedad === tipoPropiedad);
    console.log(`📊 Propiedades del tipo ${tipoPropiedad}: ${filteredListings.length}`);
    
    // PASO 2: Si hay suficientes, filtrar también por dormitorios similares (±1)
    const dormitoriosNum = parseInt(dormitorios.toString());
    const dormitoriosFiltrados = filteredListings.filter(l => 
      Math.abs(l.dormitorios - dormitoriosNum) <= 1
    );
    
    console.log(`🛏️ Con ${dormitoriosNum}±1 dormitorios: ${dormitoriosFiltrados.length}`);
    
    // Si tenemos suficientes con dormitorios similares, usar esos
    if (dormitoriosFiltrados.length >= 20) {
      filteredListings = dormitoriosFiltrados;
      console.log(`✅ Usando listings con dormitorios similares`);
    } else if (filteredListings.length >= 30) {
      console.log(`⚠️ Pocos con dormitorios exactos, usando todos del tipo ${tipoPropiedad}`);
    } else {
      // Si no hay suficientes del tipo exacto, expandir gradualmente
      console.log(`❌ Muy pocos del tipo ${tipoPropiedad}, expandiendo búsqueda...`);
      
      // Agregar el tipo opuesto con penalización fuerte
      const otherType = tipoPropiedad === 'casa' ? 'departamento' : 'casa';
      const otherTypeListings = listings.filter(l => l.tipoPropiedad === otherType);
      
      // Aplicar factor de conversión fuerte entre tipos
      const conversionFactor = tipoPropiedad === 'casa' ? 1.8 : 0.55; // Casa +80%, Depto -45%
      
      filteredListings = [
        ...filteredListings,
        ...otherTypeListings.map(listing => ({
          ...listing,
          precio: Math.round(listing.precio * conversionFactor)
        }))
      ];
      
      console.log(`🔄 Expandido con ${otherTypeListings.length} propiedades convertidas (factor ${conversionFactor})`);
    }
    
    console.log(`📈 Total listings para análisis: ${filteredListings.length}`);
    
    if (filteredListings.length === 0) {
      return NextResponse.json(
        { 
          error: `No se encontraron propiedades similares de tipo ${tipoPropiedad} en ${comuna}`,
          suggestion: 'Intente con otro tipo de propiedad o comuna'
        },
        { status: 404 }
      );
    }
    
    // PASO 3: Calcular precios con ajustes menores por características específicas
    const rents = filteredListings.map((listing: { precio: number; m2: number; tipoPropiedad: string; dormitorios: number; estacionamientos: number; bodega: boolean }) => {
      // Precio base por m2
      const pricePerM2 = listing.precio / listing.m2;
      const basePrice = pricePerM2 * m2;
      
      // Ajustes finos por características específicas
      const estacionamientoDiff = estacionamientos - listing.estacionamientos;
      const bodegaDiff = bodega && !listing.bodega ? 1 : (!bodega && listing.bodega ? -1 : 0);
      const dormitoriosDiff = dormitorios - listing.dormitorios;
      
      // Factores de ajuste más pronunciados
      const estacionamientoFactor = estacionamientoDiff * 0.12; // 12% por estacionamiento
      const bodegaFactor = bodegaDiff * 0.08; // 8% por bodega  
      const dormitoriosFactor = dormitoriosDiff * 0.15; // 15% por dormitorio adicional
      
      const adjustedPrice = basePrice * (1 + estacionamientoFactor + bodegaFactor + dormitoriosFactor);
      
      // Log de ajustes significativos
      if (Math.abs(estacionamientoDiff) > 0 || bodegaDiff !== 0 || Math.abs(dormitoriosDiff) > 0) {
        console.log(`🔧 Ajuste fino: ${listing.tipoPropiedad} ${listing.dormitorios}D -> ${dormitorios}D, Est:${listing.estacionamientos}->${estacionamientos}, Bodega:${listing.bodega}->${bodega}, Precio: ${Math.round(basePrice)} -> ${Math.round(adjustedPrice)}`);
      }
      
      return Math.round(adjustedPrice);
    });
    rents.sort((a: number, b: number) => a - b);
    const p = (q: number) => rents[Math.floor((rents.length - 1) * q)];
    const p25 = p(0.25);
    const p50 = p(0.50);
    const p75 = p(0.75);
    const min = rents[0];
    const max = rents[rents.length - 1];
    const avg = Math.round(rents.reduce((s: number, r: number) => s + r, 0) / rents.length);
    const responseData = {
      min, max, avg, p25, p50, p75,
      minFmt: clp(min),
      maxFmt: clp(max),
      avgFmt: clp(avg),
      p25Fmt: clp(p25),
      p50Fmt: clp(p50),
      p75Fmt: clp(p75),
      count: rents.length,
      comuna,
      m2,
      tipoPropiedad,
      dormitorios,
      dataQuality: {
        allActive: true,
        maxAge: '1 año',
        lastUpdated: new Date().toISOString().split('T')[0],
        sources: [...new Set(listings.map(l => l.sourceUrl).filter(Boolean))].length
      }
    };
    
    // Sanitizar salida
    const sanitizedResponse = sanitizeOutput(responseData);
    
    // Log de éxito
    logSecurityEvent('PREDICTION_SUCCESS', { comuna, m2, count: rents.length }, clientIP);
    
    return NextResponse.json(sanitizedResponse, {
      headers: {
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    });
  } catch (error) {
    console.error('❌ Error en la predicción:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 