const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Cliente para PostgreSQL (Supabase)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Detonador07!@db.edxiveestulqjvflkrhi.supabase.co:5432/postgres"
    }
  }
});

async function importData() {
  try {
    console.log('📥 Importando datos a Supabase...');
    
    // Leer datos exportados
    const data = JSON.parse(fs.readFileSync('exported-data.json', 'utf8'));
    console.log(`📊 Cargando ${data.listings.length} listings y ${data.logs.length} logs`);
    
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conectado a Supabase');
    
    // Limpiar tablas existentes
    console.log('🗑️ Limpiando tablas existentes...');
    await prisma.listing.deleteMany();
    await prisma.scrapeLog.deleteMany();
    
    // Importar listings en lotes
    const batchSize = 100;
    let imported = 0;
    
    console.log('📦 Importando listings...');
    for (let i = 0; i < data.listings.length; i += batchSize) {
      const batch = data.listings.slice(i, i + batchSize);
      
      await prisma.listing.createMany({
        data: batch.map(listing => ({
          comuna: listing.comuna,
          m2: listing.m2,
          precio: listing.precio,
          tipoPropiedad: listing.tipoPropiedad,
          dormitorios: listing.dormitorios,
          estacionamientos: listing.estacionamientos,
          bodega: listing.bodega,
          status: listing.status,
          publishedAt: new Date(listing.publishedAt),
          expiresAt: listing.expiresAt ? new Date(listing.expiresAt) : null,
          sourceUrl: listing.sourceUrl,
          sourceId: listing.sourceId,
          createdAt: new Date(listing.createdAt),
          updatedAt: new Date(listing.updatedAt)
        })),
        skipDuplicates: true
      });
      
      imported += batch.length;
      console.log(`⏳ Importados ${imported}/${data.listings.length} listings`);
    }
    
    // Importar logs
    console.log('📝 Importando logs...');
    if (data.logs.length > 0) {
      await prisma.scrapeLog.createMany({
        data: data.logs.map(log => ({
          startedAt: new Date(log.startedAt),
          created: log.created,
          updated: log.updated,
          durationMs: log.durationMs,
          status: log.status,
          message: log.message,
          totalProcessed: log.totalProcessed,
          totalCreated: log.totalCreated,
          startTime: new Date(log.startTime),
          metadata: log.metadata
        })),
        skipDuplicates: true
      });
    }
    
    // Verificar importación
    const listingCount = await prisma.listing.count();
    const logCount = await prisma.scrapeLog.count();
    
    console.log(`✅ Importación completada:`);
    console.log(`   📊 ${listingCount} listings importados`);
    console.log(`   📝 ${logCount} logs importados`);
    
    // Mostrar algunas estadísticas
    const comunas = await prisma.listing.groupBy({
      by: ['comuna'],
      _count: true,
      orderBy: {
        _count: {
          comuna: 'desc'
        }
      },
      take: 5
    });
    
    console.log('\n🏙️ Top 5 comunas:');
    comunas.forEach(c => {
      console.log(`   ${c.comuna}: ${c._count} listings`);
    });
    
  } catch (error) {
    console.error('❌ Error en importación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();