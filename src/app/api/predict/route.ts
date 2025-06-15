export const runtime = 'nodejs';
console.log("🔁 predict handler loaded");

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const comuna = searchParams.get('comuna')?.toLowerCase();
    const m2 = parseInt(searchParams.get('m2') || '0');

    if (!comuna || isNaN(m2) || m2 <= 0) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    const listings = await prisma.listing.findMany({
      where: {
        comuna: { contains: comuna, mode: 'insensitive' },
        m2: {
          gte: m2 - 10,
          lte: m2 + 10
        }
      },
      orderBy: { precio: 'asc' },
      take: 5
    });

    if (listings.length === 0) {
      return NextResponse.json({ error: 'No found' }, { status: 404 });
    }

    const rents = listings.map((l: { precio: number }) => l.precio);
    const min = Math.min(...rents);
    const max = Math.max(...rents);

    return NextResponse.json({ min, max, count: listings.length, sample: listings }, { status: 200 });
  } catch (error) {
    console.error('Error en el endpoint /api/predict:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 