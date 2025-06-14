const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// URLs de ejemplo para scraping
const urls = {
  PORTALINMOBILIARIO: [
    'https://www.portalinmobiliario.com/arriendo/departamento/region-metropolitana?page=1',
    'https://www.portalinmobiliario.com/arriendo/departamento/region-metropolitana?page=2',
    'https://www.portalinmobiliario.com/arriendo/departamento/region-metropolitana?page=3',
    'https://www.portalinmobiliario.com/arriendo/departamento/region-metropolitana?page=4',
    'https://www.portalinmobiliario.com/arriendo/departamento/region-metropolitana?page=5'
  ],
  YAPO: [
    'https://www.yapo.cl/region_metropolitana/arriendo_departamentos',
    'https://www.yapo.cl/las_condes/arriendo_departamentos',
    'https://www.yapo.cl/providencia/arriendo_departamentos',
    'https://www.yapo.cl/nunoa/arriendo_departamentos',
    'https://www.yapo.cl/macul/arriendo_departamentos'
  ]
};

// Función para simular delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Datos dummy para simular avisos
const dummyListings = [
  // Portalinmobiliario (15 avisos)
  {
    externalId: 'PI-001',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Santiago',
    areaM2: 80,
    bedrooms: 2,
    bathrooms: 1,
    rentCLP: 450000
  },
  {
    externalId: 'PI-002',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Las Condes',
    areaM2: 90,
    bedrooms: 3,
    bathrooms: 2,
    rentCLP: 550000
  },
  {
    externalId: 'PI-003',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Providencia',
    areaM2: 75,
    bedrooms: 2,
    bathrooms: 1,
    rentCLP: 480000
  },
  {
    externalId: 'PI-004',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Ñuñoa',
    areaM2: 85,
    bedrooms: 2,
    bathrooms: 2,
    rentCLP: 520000
  },
  {
    externalId: 'PI-005',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Macul',
    areaM2: 70,
    bedrooms: 1,
    bathrooms: 1,
    rentCLP: 380000
  },
  {
    externalId: 'PI-006',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'La Florida',
    areaM2: 95,
    bedrooms: 3,
    bathrooms: 2,
    rentCLP: 580000
  },
  {
    externalId: 'PI-007',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Maipú',
    areaM2: 100,
    bedrooms: 3,
    bathrooms: 2,
    rentCLP: 520000
  },
  {
    externalId: 'PI-008',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Santiago',
    areaM2: 65,
    bedrooms: 1,
    bathrooms: 1,
    rentCLP: 350000
  },
  {
    externalId: 'PI-009',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Las Condes',
    areaM2: 120,
    bedrooms: 4,
    bathrooms: 3,
    rentCLP: 750000
  },
  {
    externalId: 'PI-010',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Providencia',
    areaM2: 110,
    bedrooms: 3,
    bathrooms: 2,
    rentCLP: 680000
  },
  {
    externalId: 'PI-011',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Ñuñoa',
    areaM2: 95,
    bedrooms: 3,
    bathrooms: 2,
    rentCLP: 590000
  },
  {
    externalId: 'PI-012',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Macul',
    areaM2: 85,
    bedrooms: 2,
    bathrooms: 2,
    rentCLP: 480000
  },
  {
    externalId: 'PI-013',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'La Florida',
    areaM2: 105,
    bedrooms: 3,
    bathrooms: 2,
    rentCLP: 620000
  },
  {
    externalId: 'PI-014',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Maipú',
    areaM2: 115,
    bedrooms: 4,
    bathrooms: 3,
    rentCLP: 680000
  },
  {
    externalId: 'PI-015',
    source: 'PORTALINMOBILIARIO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Santiago',
    areaM2: 90,
    bedrooms: 2,
    bathrooms: 2,
    rentCLP: 520000
  },
  // Yapo (10 avisos)
  {
    externalId: 'YAPO-001',
    source: 'YAPO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Santiago',
    areaM2: 85,
    bedrooms: 2,
    bathrooms: 1,
    rentCLP: 420000
  },
  {
    externalId: 'YAPO-002',
    source: 'YAPO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Las Condes',
    areaM2: 95,
    bedrooms: 3,
    bathrooms: 2,
    rentCLP: 580000
  },
  {
    externalId: 'YAPO-003',
    source: 'YAPO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Providencia',
    areaM2: 80,
    bedrooms: 2,
    bathrooms: 1,
    rentCLP: 450000
  },
  {
    externalId: 'YAPO-004',
    source: 'YAPO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Ñuñoa',
    areaM2: 90,
    bedrooms: 2,
    bathrooms: 2,
    rentCLP: 510000
  },
  {
    externalId: 'YAPO-005',
    source: 'YAPO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Macul',
    areaM2: 75,
    bedrooms: 1,
    bathrooms: 1,
    rentCLP: 380000
  },
  {
    externalId: 'YAPO-006',
    source: 'YAPO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'La Florida',
    areaM2: 100,
    bedrooms: 3,
    bathrooms: 2,
    rentCLP: 550000
  },
  {
    externalId: 'YAPO-007',
    source: 'YAPO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Maipú',
    areaM2: 110,
    bedrooms: 3,
    bathrooms: 2,
    rentCLP: 600000
  },
  {
    externalId: 'YAPO-008',
    source: 'YAPO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Santiago',
    areaM2: 70,
    bedrooms: 1,
    bathrooms: 1,
    rentCLP: 350000
  },
  {
    externalId: 'YAPO-009',
    source: 'YAPO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Las Condes',
    areaM2: 130,
    bedrooms: 4,
    bathrooms: 3,
    rentCLP: 800000
  },
  {
    externalId: 'YAPO-010',
    source: 'YAPO',
    publishedAt: new Date(),
    lat: -33.4489,
    lon: -70.6693,
    commune: 'Providencia',
    areaM2: 120,
    bedrooms: 3,
    bathrooms: 2,
    rentCLP: 720000
  }
];

async function main() {
  let inserted = 0;
  let updated = 0;

  try {
    // Simular scraping de URLs
    for (const [source, sourceUrls] of Object.entries(urls)) {
      for (const url of sourceUrls) {
        console.log(`Scraping ${url}...`);
        await sleep(1000); // Throttle de 1 segundo
      }
    }

    // Procesar listings
    for (const listing of dummyListings) {
      const result = await prisma.listing.upsert({
        where: { externalId: listing.externalId },
        update: listing,
        create: listing
      });

      if (result) {
        if (result.createdAt === result.updatedAt) {
          inserted++;
        } else {
          updated++;
        }
      }
    }

    console.log(`Avisos insertados: ${inserted}`);
    console.log(`Avisos actualizados: ${updated}`);
    console.log(`Total: ${inserted + updated}`);

  } catch (error) {
    console.error('Error durante el scraping:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function scrapePortalInmobiliario(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RentWidgetBot/0.1'
      }
    });
    await sleep(1000); // Añadir 1 segundo de delay entre requests
    // ... existing code ...
  } catch (error) {
    console.error('Error durante el scraping:', error);
  }
}

main().catch(console.error); 