"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PriceBucket {
  bucket: string;
  count: number;
}

interface AdminData {
  total: number;
  last: string | null;
  data: PriceBucket[];
}

export default function AdminPage() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin-data")
      .then((res) => res.json())
      .then((data) => {
        setAdminData(data);
        setLoading(false);
      });
  }, []);

  if (loading || !adminData) return <div>Cargando...</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Rent Widget – Admin</h1>
      <p>Total listings: {adminData.total}</p>
      <p>Último scrape: {adminData.last}</p>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={adminData.data}>
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

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 