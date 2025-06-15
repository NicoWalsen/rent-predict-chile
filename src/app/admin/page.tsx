'use client';

import { PrismaClient } from '@prisma/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const prisma = new PrismaClient();

export default async function Admin() {
  const total = await prisma.listing.count();
  const last = await prisma.scrapeLog.findFirst({ 
    orderBy: { startedAt: 'desc' } 
  });
  
  const data = await prisma.$queryRaw`
    SELECT width_bucket(rent_clp, 0, 1000000, 10) AS bucket, COUNT(*)::int AS n
    FROM "Listing" GROUP BY bucket ORDER BY bucket;
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
            <Bar dataKey="n" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 