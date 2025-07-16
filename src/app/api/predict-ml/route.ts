import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const comuna = searchParams.get('comuna');
    const m2 = Number(searchParams.get('m2'));

    if (!comuna || !m2) {
      return NextResponse.json(
        { error: 'Comuna y metros cuadrados son requeridos' },
        { status: 400 }
      );
    }

    // Obtener datos de la base de datos
    const listings = await prisma.listing.findMany({
      where: {
        comuna: {
          equals: comuna,
        }
      },
      select: {
        precio: true,
        m2: true
      }
    });

    if (listings.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron propiedades en la comuna especificada' },
        { status: 404 }
      );
    }

    // Calcular predicción
    const rents = listings.map(listing => Math.round((listing.precio / listing.m2) * m2));
    rents.sort((a, b) => a - b);

    const p = (q: number) => rents[Math.floor((rents.length - 1) * q)];
    const p25 = p(0.25);
    const p50 = p(0.50);
    const p75 = p(0.75);

    return NextResponse.json({
      precioEstimado: p50,
      rangoPrecios: {
        min: rents[0],
        max: rents[rents.length - 1]
      },
      percentiles: {
        p25,
        p50,
        p75
      },
      count: rents.length
    });
  } catch (error) {
    console.error('Error en predict-ml:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 