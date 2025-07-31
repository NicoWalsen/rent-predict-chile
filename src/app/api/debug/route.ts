import { NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Capturar todos los parámetros que llegan
    const params = {
      comuna: searchParams.get('comuna'),
      m2: searchParams.get('m2'),
      tipoPropiedad: searchParams.get('tipoPropiedad'),
      dormitorios: searchParams.get('dormitorios'),
      estacionamientos: searchParams.get('estacionamientos'),
      bodega: searchParams.get('bodega')
    };
    
    console.log('🔍 DEBUG - Parámetros recibidos:', params);
    
    return NextResponse.json({
      message: 'Debug de parámetros',
      params: params,
      url: request.url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en debug:', error);
    return NextResponse.json(
      { error: 'Error en debug endpoint' },
      { status: 500 }
    );
  }
}