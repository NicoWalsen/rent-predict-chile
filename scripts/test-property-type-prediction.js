const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPropertyTypePrediction() {
  try {
    console.log('🧪 Probando diferencias de predicción por tipo de propiedad...\n');
    
    // Simular consulta para departamento
    const comuna = 'Las Condes';
    const m2 = 60;
    const estacionamientos = 0;
    const bodega = false;
    const dormitorios = 2;
    
    console.log(`📍 Datos de prueba: ${comuna}, ${m2}m², ${dormitorios} dormitorios`);
    console.log('='.repeat(60));

    // Obtener listings de la base de datos
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const listings = await prisma.listing.findMany({
      where: {
        comuna: { equals: comuna },
        status: 'active',
        publishedAt: { gte: oneYearAgo }
      },
      select: {
        precio: true,
        m2: true,
        tipoPropiedad: true,
        dormitorios: true,
        estacionamientos: true,
        bodega: true
      }
    });

    console.log(`📊 Total listings encontrados: ${listings.length}`);
    
    // Separar por tipo
    const departamentos = listings.filter(l => l.tipoPropiedad === 'departamento');
    const casas = listings.filter(l => l.tipoPropiedad === 'casa');
    
    console.log(`🏢 Departamentos: ${departamentos.length}`);
    console.log(`🏠 Casas: ${casas.length}\n`);

    // Función de cálculo (igual que en la API)
    const calcularRents = (tipoPropiedad) => {
      return listings.map((listing) => {
        const basePrice = (listing.precio / listing.m2) * m2;
        
        const estacionamientoDiff = estacionamientos - listing.estacionamientos;
        const bodegaDiff = bodega && !listing.bodega ? 1 : (!bodega && listing.bodega ? -1 : 0);
        const dormitoriosDiff = dormitorios - listing.dormitorios;
        
        // Factor de tipo de propiedad (código actual)
        let propertyTypeFactor = 0;
        if (tipoPropiedad !== listing.tipoPropiedad) {
          if (tipoPropiedad === 'casa' && listing.tipoPropiedad === 'departamento') {
            propertyTypeFactor = 0.40; // Casas 40% más caras
          } else if (tipoPropiedad === 'departamento' && listing.tipoPropiedad === 'casa') {
            propertyTypeFactor = -0.30; // Departamentos 30% más baratos
          }
        }
        
        const estacionamientoFactor = estacionamientoDiff * 0.08;
        const bodegaFactor = bodegaDiff * 0.05;
        const dormitoriosFactor = dormitoriosDiff * 0.05;
        
        const adjustedPrice = basePrice * (1 + propertyTypeFactor + estacionamientoFactor + bodegaFactor + dormitoriosFactor);
        
        // Log para debug
        if (Math.abs(propertyTypeFactor) > 0) {
          console.log(`🔍 Ajuste aplicado: ${listing.tipoPropiedad} → ${tipoPropiedad}, factor: ${propertyTypeFactor}, precio base: ${Math.round(basePrice)} → ajustado: ${Math.round(adjustedPrice)}`);
        }
        
        return Math.round(adjustedPrice);
      });
    };

    // Calcular para departamento
    console.log('🏢 CALCULANDO PARA DEPARTAMENTO:');
    const rentsDepto = calcularRents('departamento');
    rentsDepto.sort((a, b) => a - b);
    const avgDepto = Math.round(rentsDepto.reduce((s, r) => s + r, 0) / rentsDepto.length);
    
    console.log(`📊 Promedio departamento: CLP ${avgDepto.toLocaleString('es-CL')}`);
    console.log(`📊 Min-Max departamento: CLP ${rentsDepto[0].toLocaleString('es-CL')} - CLP ${rentsDepto[rentsDepto.length-1].toLocaleString('es-CL')}\n`);

    // Calcular para casa
    console.log('🏠 CALCULANDO PARA CASA:');
    const rentsCasa = calcularRents('casa');
    rentsCasa.sort((a, b) => a - b);
    const avgCasa = Math.round(rentsCasa.reduce((s, r) => s + r, 0) / rentsCasa.length);
    
    console.log(`📊 Promedio casa: CLP ${avgCasa.toLocaleString('es-CL')}`);
    console.log(`📊 Min-Max casa: CLP ${rentsCasa[0].toLocaleString('es-CL')} - CLP ${rentsCasa[rentsCasa.length-1].toLocaleString('es-CL')}\n`);

    // Mostrar diferencia
    const diferencia = avgCasa - avgDepto;
    const porcentajeDif = ((diferencia / avgDepto) * 100).toFixed(1);
    
    console.log('='.repeat(60));
    console.log(`💰 DIFERENCIA: CLP ${diferencia.toLocaleString('es-CL')} (${porcentajeDif}%)`);
    
    if (Math.abs(diferencia) < 50000) {
      console.log('⚠️  PROBLEMA: La diferencia es muy pequeña - revisar algoritmo');
    } else {
      console.log('✅ CORRECTO: Hay diferencia significativa entre tipos');
    }

  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPropertyTypePrediction();