const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('📊 Exportando datos de SQLite...');
    
    // Obtener todos los listings
    const listings = await prisma.listing.findMany();
    console.log(`✅ Encontrados ${listings.length} listings`);
    
    // Obtener todos los logs
    const logs = await prisma.scrapeLog.findMany();
    console.log(`✅ Encontrados ${logs.length} logs`);
    
    // Guardar en archivo JSON
    const data = {
      listings: listings.map(l => ({
        comuna: l.comuna,
        m2: l.m2,
        precio: l.precio,
        tipoPropiedad: l.tipoPropiedad,
        dormitorios: l.dormitorios,
        estacionamientos: l.estacionamientos,
        bodega: l.bodega,
        status: l.status,
        publishedAt: l.publishedAt.toISOString(),
        expiresAt: l.expiresAt ? l.expiresAt.toISOString() : null,
        sourceUrl: l.sourceUrl,
        sourceId: l.sourceId,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString()
      })),
      logs: logs.map(l => ({
        startedAt: l.startedAt.toISOString(),
        created: l.created,
        updated: l.updated,
        durationMs: l.durationMs,
        status: l.status,
        message: l.message,
        totalProcessed: l.totalProcessed,
        totalCreated: l.totalCreated,
        startTime: l.startTime.toISOString(),
        metadata: l.metadata
      }))
    };
    
    fs.writeFileSync('exported-data.json', JSON.stringify(data, null, 2));
    console.log('💾 Datos exportados a exported-data.json');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();