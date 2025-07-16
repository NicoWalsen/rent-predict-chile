import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Global para reutilizar conexiones en Vercel
declare global {
  var prisma: PrismaClient | undefined;
}

// Función para obtener cliente Prisma (optimizada para Vercel)
function getPrismaClient() {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }
  return global.prisma;
}

export async function GET(request: Request) {
  let prisma: PrismaClient | null = null;
  
  try {
    console.log('🚀 [SERVERLESS] Iniciando predicción...');
    
    // Verificar variables de entorno
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL no está configurada');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }
    
    console.log('✅ DATABASE_URL configurada:', process.env.DATABASE_URL.substring(0, 20) + '...');
    
    // Obtener cliente Prisma
    prisma = getPrismaClient();
    console.log('✅ Cliente Prisma inicializado');
    
    // Extraer parámetros de la URL
    const { searchParams } = new URL(request.url);
    const comuna = searchParams.get('comuna') || 'Santiago';
    const m2 = searchParams.get('m2') || '80';
    const estacionamientos = searchParams.get('estacionamientos') || '0';
    const bodega = searchParams.get('bodega') === 'true';
    const tipoPropiedad = searchParams.get('tipoPropiedad') || 'departamento';
    const dormitorios = searchParams.get('dormitorios') || '2';
    
    console.log('📝 Parámetros procesados:', { comuna, m2, estacionamientos, bodega, tipoPropiedad, dormitorios });
    
    // Validar parámetros
    if (!comuna || !m2) {
      return NextResponse.json(
        { error: 'Comuna y metros cuadrados son requeridos' },
        { status: 400 }
      );
    }

    const m2Num = parseInt(m2);
    const estacionamientosNum = parseInt(estacionamientos);
    const dormitoriosNum = parseInt(dormitorios);

    console.log('🔍 Consultando base de datos...');
    
    // Test de conexión primero
    await prisma.$connect();
    console.log('✅ Conexión a BD establecida');
    
    // Contar total de listings
    const totalCount = await prisma.listing.count();
    console.log(`📊 Total de listings en BD: ${totalCount}`);
    
    // Buscar listings en la comuna
    const comunaListings = await prisma.listing.findMany({
      where: {
        comuna: {
          equals: comuna,
          mode: 'insensitive'
        },
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
      take: 100, // Limitar para evitar timeouts
      orderBy: {
        publishedAt: 'desc'
      }
    });
    
    console.log(`📍 Listings encontrados en ${comuna}: ${comunaListings.length}`);

    if (comunaListings.length === 0) {
      // Buscar en todas las comunas como fallback
      const fallbackListings = await prisma.listing.findMany({
        where: {
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
        take: 50,
        orderBy: {
          publishedAt: 'desc'
        }
      });
      
      console.log(`🔄 Usando fallback con ${fallbackListings.length} listings`);
      
      if (fallbackListings.length === 0) {
        return NextResponse.json(
          { error: 'No hay datos disponibles' },
          { status: 404 }
        );
      }
      
      // Usar fallback listings
      return NextResponse.json({
        predicted_price: 600000,
        sample_size: fallbackListings.length,
        confidence: 50,
        percentiles: {
          p10: 480000,
          p25: 540000,
          p50: 600000,
          p75: 660000,
          p90: 720000
        },
        market_condition: 'fallback',
        comuna: comuna,
        m2: m2Num,
        tipoPropiedad,
        dormitorios: dormitoriosNum,
        estacionamientos: estacionamientosNum,
        bodega,
        debug: {
          totalListings: totalCount,
          comunaListings: 0,
          fallbackUsed: true
        }
      });
    }

    // Filtrar por tipo de propiedad
    let filteredListings = comunaListings.filter(l => l.tipoPropiedad === tipoPropiedad);
    
    if (filteredListings.length < 5) {
      filteredListings = comunaListings;
    }

    console.log(`🏠 Listings filtrados por tipo: ${filteredListings.length}`);

    // Calcular precios ajustados
    const rents = filteredListings.map(listing => {
      const pricePerM2 = listing.precio / listing.m2;
      const basePrice = pricePerM2 * m2Num;
      
      // Ajustes simples
      const estacionamientoDiff = estacionamientosNum - listing.estacionamientos;
      const bodegaDiff = bodega && !listing.bodega ? 1 : (!bodega && listing.bodega ? -1 : 0);
      const dormitoriosDiff = dormitoriosNum - listing.dormitorios;
      
      const estacionamientoFactor = estacionamientoDiff * 0.1;
      const bodegaFactor = bodegaDiff * 0.05;
      const dormitoriosFactor = dormitoriosDiff * 0.1;
      
      const adjustedPrice = basePrice * (1 + estacionamientoFactor + bodegaFactor + dormitoriosFactor);
      
      return Math.round(Math.max(100000, adjustedPrice)); // Mínimo 100k
    });

    rents.sort((a, b) => a - b);
    
    console.log(`💰 Precios calculados: ${rents.length} valores`);
    
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

    const result = {
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
      bodega,
      debug: {
        totalListings: totalCount,
        comunaListings: comunaListings.length,
        filteredListings: filteredListings.length,
        serverless: true
      }
    };

    console.log('✅ Predicción completada:', {
      predicted_price: result.predicted_price,
      confidence: result.confidence,
      sample_size: result.sample_size
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error en predicción serverless:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido',
      type: 'serverless_error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    // No cerrar la conexión para reutilizar en Vercel
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Convertir POST a GET
    const searchParams = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      searchParams.set(key, String(value));
    });
    
    const mockRequest = {
      url: `http://localhost/api/predict-serverless?${searchParams.toString()}`
    } as Request;
    
    return await GET(mockRequest);
    
  } catch (error) {
    console.error('❌ Error en POST serverless:', error);
    
    return NextResponse.json({
      error: 'Error en POST serverless',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}