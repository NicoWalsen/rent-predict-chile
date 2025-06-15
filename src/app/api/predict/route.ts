import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper para formatear CLP
const clp = (n: number) => 'CLP ' + n.toLocaleString('es-CL');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { comuna, m2 } = body;

    if (!comuna || !m2) {
      return NextResponse.json(
        { error: 'Comuna y metros cuadrados son requeridos' },
        { status: 400 }
      );
    }

    // Obtener todos los datos de la tabla listing
    const listings = await prisma.listing.findMany({
      where: {
        comuna: {
          equals: comuna,
          mode: 'insensitive'
        }
      },
      select: {
        precio: true,
        m2: true
      }
    });

    if (listings.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron propiedades en la comuna especificada' },
        { status: 404 }
      );
    }

    // Calcular los arriendos estimados para el m2 solicitado
    const rents = listings.map((listing: { precio: number; m2: number }) => Math.round((listing.precio / listing.m2) * m2));
    rents.sort((a: number, b: number) => a - b);
    const p = (q: number) => rents[Math.floor((rents.length - 1) * q)];
    const p25 = p(0.25);
    const p50 = p(0.50);
    const p75 = p(0.75);
    const min = rents[0];
    const max = rents[rents.length - 1];
    const avg = Math.round(rents.reduce((s: number, r: number) => s + r, 0) / rents.length);

    return NextResponse.json({
      min, max, avg, p25, p50, p75,
      minFmt: clp(min),
      maxFmt: clp(max),
      avgFmt: clp(avg),
      p25Fmt: clp(p25),
      p50Fmt: clp(p50),
      p75Fmt: clp(p75),
      count: rents.length,
      comuna,
      m2
    });
  } catch (error) {
    console.error('Error en la predicción:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// GET para compatibilidad con curl de vercel
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const comuna = searchParams.get('comuna');
    const m2 = Number(searchParams.get('m2'));
    if (!comuna || !m2) {
      return NextResponse.json(
        { error: 'Comuna y metros cuadrados son requeridos' },
        { status: 400 }
      );
    }
    // Obtener todos los datos de la tabla listing
    const listings = await prisma.listing.findMany({
      where: {
        comuna: {
          equals: comuna,
          mode: 'insensitive'
        }
      },
      select: {
        precio: true,
        m2: true
      }
    });
    if (listings.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron propiedades en la comuna especificada' },
        { status: 404 }
      );
    }
    const rents = listings.map((listing: { precio: number; m2: number }) => Math.round((listing.precio / listing.m2) * m2));
    rents.sort((a: number, b: number) => a - b);
    const p = (q: number) => rents[Math.floor((rents.length - 1) * q)];
    const p25 = p(0.25);
    const p50 = p(0.50);
    const p75 = p(0.75);
    const min = rents[0];
    const max = rents[rents.length - 1];
    const avg = Math.round(rents.reduce((s: number, r: number) => s + r, 0) / rents.length);
    return NextResponse.json({
      min, max, avg, p25, p50, p75,
      minFmt: clp(min),
      maxFmt: clp(max),
      avgFmt: clp(avg),
      p25Fmt: clp(p25),
      p50Fmt: clp(p50),
      p75Fmt: clp(p75),
      count: rents.length,
      comuna,
      m2
    });
  } catch (error) {
    console.error('Error en la predicción:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 