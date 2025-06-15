const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Entrenando modelo...');

  try {
    // Obtener datos
    const listings = await prisma.listing.findMany();
    console.log(`📊 ${listings.length} avisos encontrados`);

    // Crear modelo simple basado en percentiles
    const model = {
      version: '1.0.0',
      type: 'percentile',
      data: listings
    };

    // Guardar modelo
    fs.writeFileSync('public/model.json', JSON.stringify(model));
    console.log('✅ Modelo guardado en public/model.json');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error); 