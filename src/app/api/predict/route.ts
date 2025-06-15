export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Property {
  id: number;
  comuna: string;
  m2: number;
  precio: number;
  createdAt: string;
  updatedAt: string;
}

interface Model {
  version: string;
  type: string;
  data: Property[];
}

// Cargar datos del modelo
let model: Model;
try {
  const modelPath = path.join(process.cwd(), 'public', 'model.json');
  const modelData = fs.readFileSync(modelPath, 'utf-8');
  model = JSON.parse(modelData);
  console.log('Modelo cargado correctamente:', model.data.length, 'propiedades');
} catch (error) {
  console.error('Error al cargar el modelo:', error);
  model = { version: '1.0.0', type: 'percentile', data: [] };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const comuna = searchParams.get('comuna')?.toLowerCase();
    const m2 = parseInt(searchParams.get('m2') || '0');

    if (!comuna || isNaN(m2) || m2 <= 0) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    // Primero buscar coincidencia exacta
    const exactMatch = model.data.find(
      (l) => l.comuna.toLowerCase() === comuna && l.m2 === m2
    );

    if (exactMatch) {
      return NextResponse.json({
        min: exactMatch.precio,
        max: exactMatch.precio,
        avg: exactMatch.precio,
        count: 1,
        sample: [exactMatch],
        isExactMatch: true,
        debug: {
          comuna,
          m2,
          totalProperties: model.data.length
        }
      }, { status: 200 });
    }

    // Si no hay coincidencia exacta, buscar propiedades similares
    const listings = model.data
      .filter((l) => 
        l.comuna.toLowerCase() === comuna &&
        Math.abs(l.m2 - m2) <= 5 // Solo propiedades con diferencia de hasta 5m²
      )
      .sort((a, b) => Math.abs(a.m2 - m2) - Math.abs(b.m2 - m2));

    // Si hay menos de 3 resultados, buscar con margen más amplio
    if (listings.length < 3) {
      const widerListings = model.data
        .filter((l) => 
          l.comuna.toLowerCase() === comuna &&
          Math.abs(l.m2 - m2) <= 10 // Ampliar a diferencia de hasta 10m²
        )
        .sort((a, b) => Math.abs(a.m2 - m2) - Math.abs(b.m2 - m2));
      
      listings.push(...widerListings.filter(l => !listings.some(existing => existing.id === l.id)));
    }

    if (listings.length === 0) {
      return NextResponse.json({ 
        error: 'No hay datos suficientes',
        debug: {
          comuna,
          m2,
          totalProperties: model.data.length,
          propertiesInComuna: model.data.filter((l) => l.comuna.toLowerCase() === comuna).length
        }
      }, { status: 404 });
    }

    const rents = listings.map((l) => l.precio);
    const min = Math.min(...rents);
    const max = Math.max(...rents);
    const avg = Math.round(rents.reduce((a, b) => a + b, 0) / rents.length);

    return NextResponse.json({ 
      min, 
      max, 
      avg,
      count: listings.length, 
      sample: listings,
      isExactMatch: false,
      debug: {
        comuna,
        m2,
        totalProperties: model.data.length,
        closestM2: listings[0].m2
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error en el endpoint /api/predict:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 