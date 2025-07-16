const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Revisando estructura de datos...\n');
    
    // Obtener algunos registros de muestra
    const samples = await prisma.listing.findMany({
      take: 5,
      where: {
        comuna: 'Santiago'
      }
    });
    
    console.log('Muestras de datos:');
    samples.forEach(item => {
      console.log(`${item.comuna}: ${item.m2}m² - $${item.precio} - Est: ${item.estacionamientos} - Bodega: ${item.bodega}`);
    });
    
    // Verificar si hay registros con estacionamientos y bodegas
    const withParking = await prisma.listing.count({
      where: { estacionamientos: { gt: 0 } }
    });
    
    const withStorage = await prisma.listing.count({
      where: { bodega: true }
    });
    
    console.log(`\nRegistros con estacionamientos: ${withParking}`);
    console.log(`Registros con bodega: ${withStorage}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();