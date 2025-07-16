import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const comunas = await prisma.listing.findMany({
      select: {
        comuna: true
      },
      distinct: ['comuna'],
      orderBy: {
        comuna: 'asc'
      }
    });

    const comunasList = comunas.map(item => item.comuna);

    return NextResponse.json({
      comunas: comunasList
    });
  } catch (error) {
    console.error('Error obteniendo comunas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las comunas' },
      { status: 500 }
    );
  }
}