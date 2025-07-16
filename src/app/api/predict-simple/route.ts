import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper para formatear CLP
const clp = (n: number) => 'CLP ' + n.toLocaleString('es-CL');

export async function GET(request: Request) {
  try {
    console.log('🚀 Predicción simple iniciada');
    
    // Extraer parámetros de la URL
    const { searchParams } = new URL(request.url);
    const comuna = searchParams.get('comuna');
    const m2 = searchParams.get('m2');
    const estacionamientos = searchParams.get('estacionamientos') || '0';
    const bodega = searchParams.get('bodega') === 'true';
    const tipoPropiedad = searchParams.get('tipoPropiedad') || 'departamento';
    const dormitorios = searchParams.get('dormitorios') || '2';
    
    console.log('📝 Parámetros:', { comuna, m2, estacionamientos, bodega, tipoPropiedad, dormitorios });
    
    if (!comuna || !m2) {
      return NextResponse.json(
        { error: 'Comuna y metros cuadrados son requeridos' },
        { status: 400 }
      );
    }

    const m2Num = parseInt(m2.toString());
    const estacionamientosNum = parseInt(estacionamientos.toString());
    const dormitoriosNum = parseInt(dormitorios.toString());

    console.log('🔍 Buscando listings en:', comuna);
    
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

    console.log(`📊 Encontrados ${listings.length} listings en ${comuna}`);

    if (listings.length === 0) {
      return NextResponse.json(
        { error: `No se encontraron propiedades en ${comuna}` },
        { status: 404 }
      );
    }

    // Filtrar por tipo de propiedad
    let filteredListings = listings.filter(l => l.tipoPropiedad === tipoPropiedad);
    
    if (filteredListings.length < 10) {
      // Si hay muy pocos, usar todos los listings
      filteredListings = listings;
    }

    // Calcular precios ajustados
    const rents = filteredListings.map(listing => {
      const pricePerM2 = listing.precio / listing.m2;
      const basePrice = pricePerM2 * m2Num;
      
      // Ajustes simples
      const estacionamientoDiff = estacionamientosNum - listing.estacionamientos;
      const bodegaDiff = bodega && !listing.bodega ? 1 : (!bodega && listing.bodega ? -1 : 0);
      const dormitoriosDiff = dormitoriosNum - listing.dormitorios;
      
      const estacionamientoFactor = estacionamientoDiff * 0.1; // 10% por estacionamiento
      const bodegaFactor = bodegaDiff * 0.05; // 5% por bodega
      const dormitoriosFactor = dormitoriosDiff * 0.1; // 10% por dormitorio
      
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

    const predicted_price = p50; // Usar mediana como predicción
    
    // Calcular confianza basada en la dispersión
    const avg = rents.reduce((sum, r) => sum + r, 0) / rents.length;
    const variance = rents.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / rents.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avg; // Coeficiente de variación
    
    const confidence = Math.max(20, Math.min(95, 100 - (cv * 100)));
    
    // Determinar condición del mercado
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
      m2: m2Num,
      tipoPropiedad,
      dormitorios: dormitoriosNum,
      estacionamientos: estacionamientosNum,
      bodega
    };

    console.log('✅ Predicción completada:', {
      predicted_price: responseData.predicted_price,
      confidence: responseData.confidence,
      sample_size: responseData.sample_size
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Error en predicción simple:', error);
    return NextResponse.json(
      { error: `Error al predecir: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Convertir a parámetros de URL y reutilizar lógica GET
    const searchParams = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      searchParams.set(key, String(value));
    });
    
    const mockRequest = {
      url: `http://localhost/api/predict-simple?${searchParams.toString()}`
    } as Request;
    
    return await GET(mockRequest);
    
  } catch (error) {
    console.error('❌ Error en predicción simple (POST):', error);
    return NextResponse.json(
      { error: `Error al predecir: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}