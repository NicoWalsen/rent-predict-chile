import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 [DEBUG-DB] Iniciando debug directo a Supabase...');

    // Usar fetch directo para conectar a Supabase sin Prisma
    const databaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({
        error: 'No database URL configured',
        env_check: {
          POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'configured' : 'missing',
          DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
          POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'configured' : 'missing'
        }
      }, { status: 500 });
    }

    console.log('✅ Database URL found:', databaseUrl.substring(0, 30) + '...');

    // Crear conexión PostgreSQL simple usando fetch al REST API de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Supabase credentials missing',
        env_check: {
          SUPABASE_URL: supabaseUrl ? 'configured' : 'missing',
          SUPABASE_KEY: supabaseKey ? 'configured' : 'missing'
        }
      }, { status: 500 });
    }

    console.log('✅ Supabase credentials found');

    // Test 1: Verificar conexión básica usando Supabase REST API
    const healthResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    console.log('🔗 Supabase connection status:', healthResponse.status);

    // Test 2: Listar todas las tablas usando información_schema
    const tablesQuery = `
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    // Usar función RPC personalizada para ejecutar queries directas
    const tablesResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: tablesQuery })
    });

    let tables = [];
    let tablesError = null;

    if (tablesResponse.ok) {
      tables = await tablesResponse.json();
    } else {
      tablesError = `Tables query failed: ${tablesResponse.status}`;
      console.log('❌ Tables query failed, trying alternative method...');
      
      // Método alternativo: Intentar acceder directamente a las tablas conocidas
      const listingTest = await fetch(`${supabaseUrl}/rest/v1/Listing?limit=1`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      const scrapeLogTest = await fetch(`${supabaseUrl}/rest/v1/ScrapeLog?limit=1`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      tables = [
        { table_name: 'Listing', status: listingTest.status, accessible: listingTest.status === 200 },
        { table_name: 'ScrapeLog', status: scrapeLogTest.status, accessible: scrapeLogTest.status === 200 }
      ];
    }

    // Test 3: Contar registros en tabla Listing si existe
    let listingCount = null;
    let listingError = null;

    try {
      const countResponse = await fetch(`${supabaseUrl}/rest/v1/Listing?select=count()`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact'
        }
      });

      if (countResponse.ok) {
        const countHeader = countResponse.headers.get('content-range');
        if (countHeader) {
          listingCount = parseInt(countHeader.split('/')[1]) || 0;
        }
      } else {
        listingError = `Count query failed: ${countResponse.status}`;
      }
    } catch (error) {
      listingError = error instanceof Error ? error.message : 'Unknown error counting listings';
    }

    // Test 4: Obtener estructura de una tabla existente
    let tableStructure = null;
    let structureError = null;

    try {
      const structureQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'Listing' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;

      const structureResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: structureQuery })
      });

      if (structureResponse.ok) {
        tableStructure = await structureResponse.json();
      } else {
        structureError = `Structure query failed: ${structureResponse.status}`;
      }
    } catch (error) {
      structureError = error instanceof Error ? error.message : 'Unknown error getting structure';
    }

    const result = {
      status: 'debug_completed',
      timestamp: new Date().toISOString(),
      connection: {
        supabase_url: supabaseUrl,
        health_status: healthResponse.status,
        connected: healthResponse.status === 200
      },
      database: {
        tables: tables,
        tables_error: tablesError,
        listing_count: listingCount,
        listing_error: listingError
      },
      schema: {
        listing_structure: tableStructure,
        structure_error: structureError
      },
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
        POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'configured' : 'missing',
        POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'configured' : 'missing',
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing'
      }
    };

    console.log('✅ Debug completed:', JSON.stringify(result, null, 2));

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in debug-db:', error);
    
    return NextResponse.json({
      error: 'Database debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack available',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}