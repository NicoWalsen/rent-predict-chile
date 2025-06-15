import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const total = await prisma.listing.count();
  const last = await prisma.scrapeLog.findFirst({ 
    orderBy: { startedAt: 'desc' } 
  });
  const data = await prisma.$queryRaw`SELECT 
    CASE 
      WHEN precio < 300000 THEN '0-300k'
      WHEN precio < 500000 THEN '300k-500k'
      WHEN precio < 700000 THEN '500k-700k'
      WHEN precio < 1000000 THEN '700k-1M'
      ELSE '1M+'
    END as bucket,
    COUNT(*) as count
    FROM "Listing"
    GROUP BY bucket
    ORDER BY MIN(precio)`;

  return NextResponse.json({
    total,
    last: last?.startedAt ? new Date(last.startedAt).toLocaleString() : null,
    data
  });
} 