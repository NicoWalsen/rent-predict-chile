const { PrismaClient } = require('@prisma/client');

// Cliente para SQLite (local)
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
});

// Cliente para PostgreSQL (Supabase)
const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Detonador07!@db.edxiveestulqjvflkrhi.supabase.co:5432/postgres"
    }
  }
});

async function migrateData() {
  try {
    console.log('🔄 Iniciando migración de datos...');
    
    // Obtener todos los listings de SQLite
    const listings = await sqlitePrisma.listing.findMany();
    console.log(`📊 Encontrados ${listings.length} listings en SQLite`);
    
    // Verificar conexión a PostgreSQL
    await postgresPrisma.$connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Limpiar tabla de PostgreSQL si existe
    await postgresPrisma.listing.deleteMany();
    console.log('🗑️ Tabla limpiada en PostgreSQL');
    
    // Migrar listings en lotes
    const batchSize = 100;
    let migrated = 0;
    
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      
      await postgresPrisma.listing.createMany({
        data: batch.map(listing => ({
          ...listing,
          id: undefined // Dejar que PostgreSQL genere nuevos IDs
        }))
      });
      
      migrated += batch.length;
      console.log(`⏳ Migrados ${migrated}/${listings.length} listings`);
    }
    
    // Verificar migración
    const postgreCount = await postgresPrisma.listing.count();
    console.log(`✅ Migración completada: ${postgreCount} listings en PostgreSQL`);
    
    // Migrar logs si existen
    const logs = await sqlitePrisma.scrapeLog.findMany();
    if (logs.length > 0) {
      await postgresPrisma.scrapeLog.deleteMany();
      await postgresPrisma.scrapeLog.createMany({
        data: logs.map(log => ({
          ...log,
          id: undefined
        }))
      });
      console.log(`📝 Migrados ${logs.length} logs`);
    }
    
    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();
  }
}

migrateData();