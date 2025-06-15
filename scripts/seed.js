const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dummyListings = [
  {
    comuna: 'Santiago',
    m2: 80,
    precio: 450000
  },
  {
    comuna: 'Las Condes',
    m2: 90,
    precio: 550000
  },
  {
    comuna: 'Providencia',
    m2: 75,
    precio: 480000
  },
  {
    comuna: 'Ñuñoa',
    m2: 85,
    precio: 520000
  },
  {
    comuna: 'Macul',
    m2: 70,
    precio: 380000
  },
  {
    comuna: 'La Florida',
    m2: 95,
    precio: 580000
  },
  {
    comuna: 'Maipú',
    m2: 100,
    precio: 520000
  },
  {
    comuna: 'Santiago',
    m2: 65,
    precio: 350000
  },
  {
    comuna: 'Las Condes',
    m2: 120,
    precio: 750000
  },
  {
    comuna: 'Providencia',
    m2: 110,
    precio: 680000
  },
  {
    comuna: 'Ñuñoa',
    m2: 95,
    precio: 590000
  },
  {
    comuna: 'Macul',
    m2: 85,
    precio: 480000
  },
  {
    comuna: 'La Florida',
    m2: 105,
    precio: 620000
  },
  {
    comuna: 'Maipú',
    m2: 115,
    precio: 680000
  },
  {
    comuna: 'Santiago',
    m2: 90,
    precio: 520000
  },
  {
    comuna: 'Providencia',
    m2: 55,
    precio: 420000
  },
  {
    comuna: 'Providencia',
    m2: 60,
    precio: 440000
  },
  {
    comuna: 'Providencia',
    m2: 85,
    precio: 500000
  },
  {
    comuna: 'Providencia',
    m2: 95,
    precio: 530000
  },
  {
    comuna: 'Providencia',
    m2: 100,
    precio: 600000
  },
  {
    comuna: 'Providencia',
    m2: 120,
    precio: 750000
  }
];

async function main() {
  console.log('🌱 Poblando base de datos...');

  try {
    // Limpiar datos existentes
    await prisma.listing.deleteMany();
    console.log('🗑️ Datos existentes eliminados');

    // Insertar nuevos datos
    for (const listing of dummyListings) {
      await prisma.listing.create({
        data: listing
      });
    }
    console.log(`✅ ${dummyListings.length} avisos insertados`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error); 