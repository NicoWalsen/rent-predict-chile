const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPropertyTypes() {
  try {
    console.log('📊 Analizando distribución de tipos de propiedad...\n');
    
    // Distribución general
    const stats = await prisma.listing.groupBy({
      by: ['tipoPropiedad'],
      _count: { tipoPropiedad: true },
      where: { status: 'active' }
    });
    
    console.log('🏠 Distribución general:');
    stats.forEach(s => {
      console.log(`  ${s.tipoPropiedad}: ${s._count.tipoPropiedad} propiedades`);
    });
    
    // Las Condes específicamente
    const lasCondes = await prisma.listing.groupBy({
      by: ['tipoPropiedad'],
      _count: { tipoPropiedad: true },
      where: { 
        comuna: 'Las Condes',
        status: 'active' 
      }
    });
    
    console.log('\n📍 Las Condes:');
    lasCondes.forEach(s => {
      console.log(`  ${s.tipoPropiedad}: ${s._count.tipoPropiedad} propiedades`);
    });
    
    // Precio promedio por tipo en Las Condes
    const avgPrices = await prisma.listing.groupBy({
      by: ['tipoPropiedad'],
      _avg: { precio: true },
      where: { 
        comuna: 'Las Condes',
        status: 'active' 
      }
    });
    
    console.log('\n💰 Precio promedio en Las Condes:');
    avgPrices.forEach(s => {
      const avg = Math.round(s._avg.precio || 0);
      console.log(`  ${s.tipoPropiedad}: CLP ${avg.toLocaleString('es-CL')}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPropertyTypes();