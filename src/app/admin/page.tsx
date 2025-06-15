'use client';

import { PrismaClient } from '@prisma/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const prisma = new PrismaClient();

interface PriceBucket {
  bucket: string;
  count: number;
}

export default async function AdminPage() {
  const total = await prisma.listing.count();
  const last = await prisma.scrapeLog.findFirst({ 
    orderBy: { startedAt: 'desc' } 
  });
  
  const data: PriceBucket[] = await prisma.$queryRaw`
    SELECT 
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
    ORDER BY MIN(precio)
  `;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Rent Widget – Admin</h1>
      <p>Total listings: {total}</p>
      <p>Último scrape: {last?.startedAt.toLocaleString()}</p>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis 
              dataKey="bucket" 
              label={{ value: 'Rango de Precio (CLP)', position: 'bottom' }}
            />
            <YAxis 
              label={{ value: 'Cantidad de Avisos', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 