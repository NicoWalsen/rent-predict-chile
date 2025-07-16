import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    console.log('🧪 Test endpoint iniciado');
    
    // Test 1: Verificar parámetros
    const { searchParams } = new URL(request.url);
    const comuna = searchParams.get('comuna') || 'Santiago';
    const m2 = searchParams.get('m2') || '80';
    
    console.log('📝 Parámetros recibidos:', { comuna, m2 });
    
    // Test 2: Verificar conexión a BD
    console.log('🔍 Probando conexión a BD...');
    const totalListings = await prisma.listing.count();
    console.log(`✅ Total listings: ${totalListings}`);
    
    // Test 3: Buscar listings de la comuna
    console.log(`🏘️ Buscando listings en ${comuna}...`);
    const comunaListings = await prisma.listing.findMany({
      where: {
        comuna: comuna
      },
      take: 5, // Solo tomar 5 para testing
      select: {
        id: true,
        precio: true,
        m2: true,
        tipoPropiedad: true,
        dormitorios: true
      }
    });
    
    console.log(`✅ Listings encontrados en ${comuna}: ${comunaListings.length}`);
    
    // Test 4: Cálculo básico
    if (comunaListings.length > 0) {
      const precios = comunaListings.map(l => l.precio);
      const precioPromedio = precios.reduce((sum, p) => sum + p, 0) / precios.length;
      console.log(`💰 Precio promedio: ${precioPromedio}`);
      
      return NextResponse.json({
        success: true,
        message: 'Test endpoint funcionando correctamente',
        data: {
          parametros: { comuna, m2 },
          database: {
            connected: true,
            totalListings,
            comunaListings: comunaListings.length,
            precioPromedio: Math.round(precioPromedio)
          },
          sample: comunaListings.slice(0, 3),
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `No se encontraron listings en ${comuna}`,
        data: {
          parametros: { comuna, m2 },
          database: {
            connected: true,
            totalListings,
            comunaListings: 0
          },
          timestamp: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error en test endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error en test endpoint',
      details: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Reutilizar lógica GET
    const searchParams = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      searchParams.set(key, String(value));
    });
    
    const mockRequest = {
      url: `http://localhost/api/test-predict?${searchParams.toString()}`
    } as Request;
    
    return await GET(mockRequest);
    
  } catch (error) {
    console.error('❌ Error en POST test endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error en POST test endpoint',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}