export const runtime = 'nodejs';
console.log("🔁 predict handler loaded");

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const comuna = searchParams.get('comuna')?.toLowerCase();
  const m2 = parseInt(searchParams.get('m2') || '0');

  if (!comuna || !m2) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  const listings = await prisma.listing.findMany({
    where: {
      commune: { contains: comuna, mode: 'insensitive' },
      areaM2: {
        gte: m2 - 10,
        lte: m2 + 10
      }
    },
    orderBy: { rentCLP: 'asc' },
    take: 5
  });

  if (listings.length === 0) {
    return NextResponse.json({ error: 'No found' }, { status: 404 });
  }

  const rents = listings.map(l => l.rentCLP);
  const min = Math.min(...rents);
  const max = Math.max(...rents);

  return NextResponse.json({ min, max, count: listings.length, sample: listings }, { status: 200 });
} 