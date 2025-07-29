import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 [DEBUG-PRISMA] Starting detailed Prisma debug...');
    
    // Step 1: Check environment variables
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'configured' : 'missing',
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'configured' : 'missing',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL
    };
    
    console.log('📋 Environment variables:', envVars);
    
    // Step 2: Try to import Prisma Client
    let importError = null;
    let PrismaClient = null;
    
    try {
      console.log('📦 Attempting to import PrismaClient...');
      const prismaModule = await import('@prisma/client');
      PrismaClient = prismaModule.PrismaClient;
      console.log('✅ PrismaClient imported successfully');
    } catch (error) {
      importError = error instanceof Error ? error.message : 'Unknown import error';
      console.error('❌ Failed to import PrismaClient:', importError);
    }
    
    // Step 3: Try to create Prisma instance
    let creationError = null;
    let prisma = null;
    
    if (PrismaClient) {
      try {
        console.log('🏗️ Creating Prisma instance...');
        prisma = new PrismaClient({
          log: ['query', 'info', 'warn', 'error'],
        });
        console.log('✅ Prisma instance created');
      } catch (error) {
        creationError = error instanceof Error ? error.message : 'Unknown creation error';
        console.error('❌ Failed to create Prisma instance:', creationError);
      }
    }
    
    // Step 4: Try to connect
    let connectionError = null;
    let connected = false;
    
    if (prisma) {
      try {
        console.log('🔌 Attempting database connection...');
        await prisma.$connect();
        connected = true;
        console.log('✅ Database connection successful');
      } catch (error) {
        connectionError = error instanceof Error ? error.message : 'Unknown connection error';
        console.error('❌ Database connection failed:', connectionError);
      }
    }
    
    // Step 5: Try a simple query
    let queryError = null;
    let queryResult = null;
    
    if (connected && prisma) {
      try {
        console.log('🔍 Attempting simple query...');
        queryResult = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Simple query successful:', queryResult);
      } catch (error) {
        queryError = error instanceof Error ? error.message : 'Unknown query error';
        console.error('❌ Simple query failed:', queryError);
      }
    }
    
    // Step 6: Try model access
    let modelError = null;
    let modelResult = null;
    
    if (connected && prisma) {
      try {
        console.log('🏠 Attempting model access...');
        modelResult = await prisma.listing.count();
        console.log('✅ Model access successful, count:', modelResult);
      } catch (error) {
        modelError = error instanceof Error ? error.message : 'Unknown model error';
        console.error('❌ Model access failed:', modelError);
      }
    }
    
    // Cleanup
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch (error) {
        console.log('Warning: Disconnect error:', error);
      }
    }
    
    const debugResult = {
      status: 'debug_completed',
      timestamp: new Date().toISOString(),
      environment: envVars,
      steps: {
        import: {
          success: !importError,
          error: importError
        },
        creation: {
          success: !creationError,
          error: creationError
        },
        connection: {
          success: connected,
          error: connectionError
        },
        query: {
          success: !!queryResult,
          result: queryResult,
          error: queryError
        },
        model: {
          success: !!modelResult,
          count: modelResult,
          error: modelError
        }
      }
    };
    
    console.log('🎯 Debug completed:', JSON.stringify(debugResult, null, 2));
    
    return NextResponse.json(debugResult);
    
  } catch (error) {
    console.error('❌ Debug endpoint failed:', error);
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack available',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}