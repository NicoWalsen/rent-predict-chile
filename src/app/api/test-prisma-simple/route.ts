import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  let prisma: PrismaClient | null = null;
  
  try {
    console.log('🧪 [TEST-PRISMA] Iniciando test básico de Prisma...');
    
    // Crear cliente Prisma simple
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    console.log('✅ Cliente Prisma creado');

    // Test 1: Conexión básica
    await prisma.$connect();
    console.log('✅ Conexión establecida');

    // Test 2: Query más simple posible
    console.log('🔍 Ejecutando query simple...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query básica exitosa:', result);

    // Test 3: Verificar si tabla Listing existe con query raw
    console.log('🔍 Verificando tabla Listing...');
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Listing'
      ) as exists
    `;
    console.log('📋 Resultado check tabla:', tableCheck);

    // Test 4: Intentar contar registros con query raw
    let countResult = null;
    let countError = null;
    
    try {
      console.log('🔢 Intentando contar registros...');
      countResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Listing"`;
      console.log('✅ Conteo exitoso:', countResult);
    } catch (error) {
      countError = error instanceof Error ? error.message : 'Unknown count error';
      console.log('❌ Error en conteo:', countError);
    }

    // Test 5: Intentar obtener un registro con query raw
    let sampleRecord = null;
    let sampleError = null;
    
    try {
      console.log('📄 Intentando obtener registro de muestra...');
      sampleRecord = await prisma.$queryRaw`SELECT * FROM "Listing" LIMIT 1`;
      console.log('✅ Registro obtenido:', sampleRecord);
    } catch (error) {
      sampleError = error instanceof Error ? error.message : 'Unknown sample error';
      console.log('❌ Error obteniendo muestra:', sampleError);
    }

    // Test 6: Intentar usar el modelo Prisma directamente
    let modelTest = null;
    let modelError = null;
    
    try {
      console.log('🏗️ Intentando usar modelo Prisma...');
      modelTest = await prisma.listing.findFirst({
        take: 1
      });
      console.log('✅ Modelo Prisma funciona:', modelTest ? 'Sí' : 'No data');
    } catch (error) {
      modelError = error instanceof Error ? error.message : 'Unknown model error';
      console.log('❌ Error en modelo Prisma:', modelError);
    }

    const response = {
      status: 'prisma_test_completed',
      timestamp: new Date().toISOString(),
      tests: {
        connection: '✅ Success',
        basic_query: result,
        table_exists: tableCheck,
        count_query: {
          result: countResult,
          error: countError
        },
        sample_record: {
          result: sampleRecord,
          error: sampleError
        },
        prisma_model: {
          result: modelTest ? 'Success' : 'No data',
          error: modelError
        }
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
        POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'configured' : 'missing',
        POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'configured' : 'missing'
      }
    };

    console.log('🎯 Test completado:', JSON.stringify(response, null, 2));

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en test-prisma-simple:', error);
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({
      error: 'Prisma test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack available',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}