import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
      VERCEL: process.env.VERCEL ? 'true' : 'false',
      VERCEL_URL: process.env.VERCEL_URL || 'not-set',
      runtime: 'edge' in process.env ? 'edge' : 'node'
    };
    
    return NextResponse.json({
      status: 'success',
      message: 'Environment variables check',
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}