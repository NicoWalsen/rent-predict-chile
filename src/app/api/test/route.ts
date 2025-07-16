import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'OK',
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString(),
      features: [
        'Nuevo modelo de predicción',
        'Filtrado por tipo de propiedad',
        'Filtrado por dormitorios',
        'Ajustes finos por características'
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en el servidor de test' },
      { status: 500 }
    );
  }
}