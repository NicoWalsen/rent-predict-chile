import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const dbCheck = await prisma.$queryRaw`SELECT 1`;
    
    // Contar listings para verificar datos
    const listingCount = await prisma.listing.count();
    
    // Verificar variables de entorno
    const envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing'
    };
    
    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        listingCount
      },
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: {
          DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
          SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
          SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}