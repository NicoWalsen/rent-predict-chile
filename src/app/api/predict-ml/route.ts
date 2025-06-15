import { readFileSync } from 'fs';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Cargar modelo
const model = JSON.parse(readFileSync('public/model.json', 'utf-8'));

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const comuna = searchParams.get('comuna')?.toLowerCase();
    const m2 = Number(searchParams.get('m2'));

    if (!comuna || !m2) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    // Filtrar datos por comuna y m2 similar
    const similarListings = model.data.filter((l: any) => 
      l.comuna.toLowerCase() === comuna &&
      Math.abs(l.m2 - m2) <= 10
    );

    if (similarListings.length === 0) {
      return NextResponse.json({ error: 'No hay datos suficientes' }, { status: 404 });
    }

    // Calcular precio promedio
    const prices = similarListings.map((l: any) => l.precio);
    const predicted = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length);

    return NextResponse.json({ predicted });
  } catch (error) {
    console.error('Error en predict-ml:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
} 