const { PrismaClient } = require('@prisma/client');

async function setupSupabase() {
  const DATABASE_URL = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!DATABASE_URL || !DATABASE_URL.includes('supabase')) {
    console.error('❌ Error: SUPABASE_DATABASE_URL no está configurada');
    console.log('📝 Configura la variable de entorno SUPABASE_DATABASE_URL con la URL de PostgreSQL de Supabase');
    console.log('📝 Formato: postgresql://postgres.edxiveestulqjvflkrhi:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL
      }
    }
  });

  try {
    console.log('🔄 Configurando base de datos en Supabase...');
    
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conectado a Supabase PostgreSQL');
    
    // Verificar si las tablas existen
    const listingCount = await prisma.listing.count();
    console.log(`📊 Listings actuales en Supabase: ${listingCount}`);
    
    const logCount = await prisma.scrapeLog.count();
    console.log(`📝 Logs actuales en Supabase: ${logCount}`);
    
    if (listingCount === 0) {
      console.log('⚠️  No hay datos en Supabase. Ejecuta el script de migración:');
      console.log('   npm run migrate:supabase');
    } else {
      console.log('✅ Base de datos configurada correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error configurando Supabase:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('🔧 Las tablas no existen. Ejecuta las migraciones:');
      console.log('   npx prisma db push');
    }
  } finally {
    await prisma.$disconnect();
  }
}

setupSupabase();