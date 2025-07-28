import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  try {
    console.log('🔬 [TEST-BASIC] Starting ultra-basic test...');
    
    const prisma = new PrismaClient();
    console.log('✅ Prisma client created');
    
    // Test 1: Just connect
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Test 2: Simple count
    const count = await prisma.listing.count();
    console.log('✅ Count successful:', count);
    
    // Test 3: One record
    const first = await prisma.listing.findFirst();
    console.log('✅ First record:', first ? 'Found' : 'Not found');
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: 'success',
      count: count,
      hasRecords: !!first,
      message: 'Prisma is working!'
    });
    
  } catch (error) {
    console.error('❌ Basic test failed:', error);
    
    return NextResponse.json({
      error: 'Basic test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}