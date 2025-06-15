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

const urlsPI = Array.from({length: 10}, (_, i) => 
  `https://www.portalinmobiliario.com/arriendo/departamento/region-metropolitana?page=${i+1}`
);
const urlsYapo = Array.from({length: 10}, (_, i) => 
  `https://www.yapo.cl/region_metropolitana/departamentos/arriendo?o=${i+1}`
);

// Función para simular delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para hacer delay entre requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Datos dummy para simular avisos
const dummyListings = [
  // Portalinmobiliario (15 avisos)
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
  }
];

async function main() {
  const startTime = Date.now();
  let created = 0;
  let updated = 0;

  try {
    console.log('Iniciando scraping...');

    // Simular scraping de cada URL
    for (const url of urlsPI) {
      await delay(800); // Delay de 800ms entre requests
      const response = await fetch(url);
      console.log(`Scraping ${url}...`);
      await sleep(1000); // Simular delay
    }

    for (const url of urlsYapo) {
      await delay(800); // Delay de 800ms entre requests
      const response = await fetch(url);
      console.log(`Scraping ${url}...`);
      await sleep(1000); // Simular delay
    }

    // Procesar listings
    for (const listing of dummyListings) {
      const result = await prisma.listing.upsert({
        where: {
          comuna_m2: {
            comuna: listing.comuna,
            m2: listing.m2
          }
        },
        update: {
          precio: listing.precio
        },
        create: listing
      });

      if (result) {
        created++;
      } else {
        updated++;
      }
    }

    console.log(`\nResumen:`);
    console.log(`- Avisos insertados: ${created}`);
    console.log(`- Avisos actualizados: ${updated}`);
    console.log(`- Total: ${created + updated}`);

    // Registrar el log al finalizar
    await prisma.scrapeLog.create({
      data: {
        created,
        updated,
        durationMs: Date.now() - startTime
      }
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 