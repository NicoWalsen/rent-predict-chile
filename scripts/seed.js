const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.listing.create({
    data: {
      externalId: 'demo-1',
      source: 'PORTALINMOBILIARIO',
      publishedAt: new Date(),
      lat: -33.4372,
      lon: -70.6506,
      commune: 'Providencia',
      areaM2: 60,
      bedrooms: 2,
      bathrooms: 1,
      rentCLP: 500000
    }
  });
  await prisma.listing.create({
    data: {
      externalId: 'demo-2',
      source: 'PORTALINMOBILIARIO',
      publishedAt: new Date(),
      lat: -33.4095,
      lon: -70.5672,
      commune: 'Las Condes',
      areaM2: 80,
      bedrooms: 3,
      bathrooms: 2,
      rentCLP: 800000
    }
  });
  console.log('Datos de ejemplo insertados');
}

main().finally(() => prisma.$disconnect()); 