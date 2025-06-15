import { readFileSync } from 'fs';
import { NextResponse } from 'next/server';
import joblib from '@swc/helpers/lib/_joblib';

export const runtime = 'nodejs';

// Cargar modelo y columnas
const [model, cols] = joblib.loadSync('public/model.joblib');

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const commune = searchParams.get('comuna');
    const m2 = Number(searchParams.get('m2'));
    const bedrooms = Number(searchParams.get('bedrooms') || '0');
    const bathrooms = Number(searchParams.get('bathrooms') || '0');

    if (!commune || !m2) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    // Preparar features
    const sample: any = { area_m2: m2, bedrooms, bathrooms };
    cols.forEach(c => sample[c] = c === `commune_${commune}` ? 1 : 0);

    // Hacer predicción
    const pred = model.predict([cols.map(c => sample[c] || 0)])[0];

    return NextResponse.json({ predicted: Math.round(pred) });
  } catch (error) {
    console.error('Error en predict-ml:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
} 