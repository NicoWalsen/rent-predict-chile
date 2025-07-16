const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Modelo de ML mejorado para predicción de arriendos
class EnhancedRentPredictionModel {
  constructor() {
    this.weights = {
      // Pesos para diferentes factores
      location: 0.35,      // Ubicación es el factor más importante
      size: 0.25,          // Tamaño (m2)
      amenities: 0.15,     // Amenidades y características
      market: 0.15,        // Condiciones del mercado
      temporal: 0.10       // Factores temporales
    };
    
    // Matriz de similitud entre comunas
    this.comunaSimilarity = {
      'Las Condes': ['Vitacura', 'Providencia', 'La Reina'],
      'Vitacura': ['Las Condes', 'Providencia', 'La Reina'],
      'Providencia': ['Las Condes', 'Ñuñoa', 'Vitacura'],
      'Ñuñoa': ['Providencia', 'Macul', 'Peñalolén'],
      'Santiago': ['San Miguel', 'Providencia'],
      'Macul': ['Ñuñoa', 'Peñalolén', 'San Miguel'],
      'Peñalolén': ['Ñuñoa', 'Macul', 'La Reina'],
      'La Reina': ['Vitacura', 'Peñalolén', 'Las Condes'],
      'San Miguel': ['Santiago', 'Macul', 'La Florida'],
      'La Florida': ['San Miguel', 'Macul', 'Maipú'],
      'Maipú': ['La Florida', 'Santiago']
    };
    
    // Factores de ajuste estacionales
    this.seasonalFactors = {
      1: 0.95,  // Enero - temporada baja
      2: 0.97,  // Febrero - temporada baja
      3: 1.05,  // Marzo - inicio año escolar
      4: 1.02,  // Abril
      5: 1.00,  // Mayo
      6: 0.98,  // Junio
      7: 0.96,  // Julio - vacaciones
      8: 1.03,  // Agosto - preparación semestre
      9: 1.00,  // Septiembre
      10: 1.01, // Octubre
      11: 1.02, // Noviembre
      12: 0.99  // Diciembre
    };
  }
  
  // Calcular score de similitud entre propiedades
  calculateSimilarityScore(target, listing) {
    let score = 0;
    let maxScore = 0;
    
    // Similitud de ubicación (40% del score)
    const locationWeight = 40;
    if (target.comuna === listing.comuna) {
      score += locationWeight;
    } else if (this.comunaSimilarity[target.comuna]?.includes(listing.comuna)) {
      score += locationWeight * 0.7; // 70% del score si es comuna similar
    } else {
      score += locationWeight * 0.3; // 30% del score si es diferente
    }
    maxScore += locationWeight;
    
    // Similitud de tamaño (25% del score)
    const sizeWeight = 25;
    const sizeDiff = Math.abs(target.m2 - listing.m2);
    const sizeScore = Math.max(0, 1 - (sizeDiff / 50)); // Penalización por cada 50m2 de diferencia
    score += sizeWeight * sizeScore;
    maxScore += sizeWeight;
    
    // Similitud de tipo de propiedad (20% del score)
    const typeWeight = 20;
    if (target.tipoPropiedad === listing.tipoPropiedad) {
      score += typeWeight;
    } else {
      score += typeWeight * 0.4; // 40% del score si es tipo diferente
    }
    maxScore += typeWeight;
    
    // Similitud de dormitorios (10% del score)
    const bedroomWeight = 10;
    const bedroomDiff = Math.abs(target.dormitorios - listing.dormitorios);
    const bedroomScore = Math.max(0, 1 - (bedroomDiff / 3)); // Penalización por diferencia
    score += bedroomWeight * bedroomScore;
    maxScore += bedroomWeight;
    
    // Similitud de estacionamientos (3% del score)
    const parkingWeight = 3;
    if (target.estacionamientos === listing.estacionamientos) {
      score += parkingWeight;
    } else {
      const parkingDiff = Math.abs(target.estacionamientos - listing.estacionamientos);
      score += parkingWeight * Math.max(0, 1 - (parkingDiff / 2));
    }
    maxScore += parkingWeight;
    
    // Similitud de bodega (2% del score)
    const storageWeight = 2;
    if (target.bodega === listing.bodega) {
      score += storageWeight;
    }
    maxScore += storageWeight;
    
    // Normalizar score (0-1)
    return score / maxScore;
  }
  
  // Aplicar factores de ajuste de precios
  applyPriceAdjustments(basePrice, listing, target) {
    let adjustedPrice = basePrice;
    
    // Ajuste por antigüedad de la publicación
    const daysOld = Math.floor((new Date() - new Date(listing.publishedAt)) / (1000 * 60 * 60 * 24));
    if (daysOld > 90) {
      adjustedPrice *= 0.98; // Reducir precio de listings antiguos
    } else if (daysOld < 30) {
      adjustedPrice *= 1.02; // Aumentar precio de listings recientes
    }
    
    // Ajuste estacional
    const currentMonth = new Date().getMonth() + 1;
    const seasonalFactor = this.seasonalFactors[currentMonth];
    adjustedPrice *= seasonalFactor;
    
    // Ajuste por diferencia de tamaño
    const sizeRatio = target.m2 / listing.m2;
    adjustedPrice *= sizeRatio;
    
    // Ajuste por tipo de propiedad
    if (target.tipoPropiedad !== listing.tipoPropiedad) {
      if (target.tipoPropiedad === 'casa' && listing.tipoPropiedad === 'departamento') {
        adjustedPrice *= 1.15; // Casas típicamente 15% más caras
      } else if (target.tipoPropiedad === 'departamento' && listing.tipoPropiedad === 'casa') {
        adjustedPrice *= 0.87; // Departamentos típicamente más baratos
      }
    }
    
    // Ajuste por dormitorios
    const bedroomDiff = target.dormitorios - listing.dormitorios;
    adjustedPrice *= (1 + bedroomDiff * 0.08); // 8% por dormitorio adicional
    
    // Ajuste por estacionamientos
    const parkingDiff = target.estacionamientos - listing.estacionamientos;
    adjustedPrice *= (1 + parkingDiff * 0.05); // 5% por estacionamiento adicional
    
    // Ajuste por bodega
    if (target.bodega && !listing.bodega) {
      adjustedPrice *= 1.03; // +3% por bodega
    } else if (!target.bodega && listing.bodega) {
      adjustedPrice *= 0.97; // -3% por no tener bodega
    }
    
    return Math.round(adjustedPrice);
  }
  
  // Filtrar outliers usando IQR
  filterOutliers(prices) {
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const q1Index = Math.floor(sortedPrices.length * 0.25);
    const q3Index = Math.floor(sortedPrices.length * 0.75);
    
    const q1 = sortedPrices[q1Index];
    const q3 = sortedPrices[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return prices.filter(price => price >= lowerBound && price <= upperBound);
  }
  
  // Calcular estadísticas avanzadas
  calculateAdvancedStats(prices) {
    const filteredPrices = this.filterOutliers(prices);
    const sortedPrices = [...filteredPrices].sort((a, b) => a - b);
    const n = sortedPrices.length;
    
    if (n === 0) return null;
    
    // Percentiles
    const p10 = sortedPrices[Math.floor(n * 0.1)];
    const p25 = sortedPrices[Math.floor(n * 0.25)];
    const p50 = sortedPrices[Math.floor(n * 0.5)];
    const p75 = sortedPrices[Math.floor(n * 0.75)];
    const p90 = sortedPrices[Math.floor(n * 0.9)];
    
    // Media y mediana
    const mean = sortedPrices.reduce((a, b) => a + b, 0) / n;
    const median = n % 2 === 0 ? 
      (sortedPrices[n/2 - 1] + sortedPrices[n/2]) / 2 : 
      sortedPrices[Math.floor(n/2)];
    
    // Desviación estándar
    const variance = sortedPrices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    // Coeficiente de variación (medida de dispersión relativa)
    const cv = stdDev / mean;
    
    // Rango intercuartílico
    const iqr = p75 - p25;
    
    return {
      count: n,
      originalCount: prices.length,
      outliersRemoved: prices.length - n,
      mean: Math.round(mean),
      median: Math.round(median),
      stdDev: Math.round(stdDev),
      cv: Math.round(cv * 100) / 100,
      iqr: Math.round(iqr),
      percentiles: {
        p10: Math.round(p10),
        p25: Math.round(p25),
        p50: Math.round(p50),
        p75: Math.round(p75),
        p90: Math.round(p90)
      },
      range: {
        min: sortedPrices[0],
        max: sortedPrices[n-1]
      }
    };
  }
  
  // Generar predicción mejorada
  async generatePrediction(target) {
    console.log(`🤖 Generando predicción ML mejorada para:`, target);
    
    try {
      // Obtener listings de la base de datos
      const allListings = await prisma.listing.findMany({
        where: {
          status: 'active',
          publishedAt: {
            gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) // 6 meses
          }
        }
      });
      
      console.log(`📊 Total de listings disponibles: ${allListings.length}`);
      
      // Calcular scores de similitud para cada listing
      const scoredListings = allListings.map(listing => ({
        ...listing,
        similarityScore: this.calculateSimilarityScore(target, listing)
      }));
      
      // Ordenar por score y tomar los más similares
      const sortedListings = scoredListings.sort((a, b) => b.similarityScore - a.similarityScore);
      
      // Tomar diferentes tamaños de muestra según disponibilidad
      let sampleSize = Math.min(100, sortedListings.length);
      if (sortedListings.length > 200) sampleSize = 150;
      if (sortedListings.length > 500) sampleSize = 200;
      
      const selectedListings = sortedListings.slice(0, sampleSize);
      
      console.log(`🎯 Usando ${selectedListings.length} listings más similares`);
      console.log(`📈 Score promedio de similitud: ${(selectedListings.reduce((acc, l) => acc + l.similarityScore, 0) / selectedListings.length).toFixed(3)}`);
      
      // Aplicar ajustes de precio basados en características
      const adjustedPrices = selectedListings.map(listing => {
        const adjustedPrice = this.applyPriceAdjustments(listing.precio, listing, target);
        return {
          ...listing,
          originalPrice: listing.precio,
          adjustedPrice,
          weight: listing.similarityScore
        };
      });
      
      // Extraer precios para análisis estadístico
      const prices = adjustedPrices.map(l => l.adjustedPrice);
      
      // Calcular estadísticas avanzadas
      const stats = this.calculateAdvancedStats(prices);
      
      if (!stats) {
        throw new Error('No se pudo calcular estadísticas - datos insuficientes');
      }
      
      console.log(`📊 Estadísticas calculadas:`, {
        count: stats.count,
        mean: stats.mean,
        cv: stats.cv,
        outliersRemoved: stats.outliersRemoved
      });
      
      // Crear predicción basada en estadísticas
      const prediction = {
        // Rango principal (P25-P75)
        mainRange: {
          min: stats.percentiles.p25,
          max: stats.percentiles.p75
        },
        
        // Rango extendido (P10-P90)
        extendedRange: {
          min: stats.percentiles.p10,
          max: stats.percentiles.p90
        },
        
        // Valores estadísticos
        predicted: stats.mean,
        median: stats.median,
        mostLikely: stats.percentiles.p50,
        
        // Percentiles completos
        percentiles: stats.percentiles,
        
        // Métricas de calidad
        confidence: this.calculateConfidence(stats),
        marketCondition: this.assessMarketCondition(stats),
        
        // Metadata
        dataQuality: {
          sampleSize: stats.count,
          originalListings: stats.originalCount,
          outliersRemoved: stats.outliersRemoved,
          avgSimilarity: selectedListings.reduce((acc, l) => acc + l.similarityScore, 0) / selectedListings.length,
          dispersion: stats.cv,
          dataFreshness: this.calculateDataFreshness(selectedListings)
        }
      };
      
      console.log(`✅ Predicción generada:`, {
        range: `${prediction.mainRange.min.toLocaleString()} - ${prediction.mainRange.max.toLocaleString()}`,
        predicted: prediction.predicted.toLocaleString(),
        confidence: prediction.confidence
      });
      
      return prediction;
      
    } catch (error) {
      console.error('❌ Error generando predicción ML:', error);
      throw error;
    }
  }
  
  // Calcular confianza de la predicción
  calculateConfidence(stats) {
    let confidence = 100;
    
    // Reducir confianza por muestra pequeña
    if (stats.count < 30) confidence -= 30;
    else if (stats.count < 50) confidence -= 20;
    else if (stats.count < 100) confidence -= 10;
    
    // Reducir confianza por alta dispersión
    if (stats.cv > 0.4) confidence -= 25;
    else if (stats.cv > 0.3) confidence -= 15;
    else if (stats.cv > 0.2) confidence -= 10;
    
    // Reducir confianza por muchos outliers
    const outlierRate = stats.outliersRemoved / stats.originalCount;
    if (outlierRate > 0.2) confidence -= 20;
    else if (outlierRate > 0.1) confidence -= 10;
    
    return Math.max(confidence, 20); // Mínimo 20% confianza
  }
  
  // Evaluar condición del mercado
  assessMarketCondition(stats) {
    const cv = stats.cv;
    
    if (cv < 0.15) return 'stable';
    if (cv < 0.25) return 'moderate';
    if (cv < 0.35) return 'volatile';
    return 'highly_volatile';
  }
  
  // Calcular frescura de los datos
  calculateDataFreshness(listings) {
    const now = new Date();
    const avgAge = listings.reduce((acc, listing) => {
      const age = (now - new Date(listing.publishedAt)) / (1000 * 60 * 60 * 24);
      return acc + age;
    }, 0) / listings.length;
    
    if (avgAge < 30) return 'very_fresh';
    if (avgAge < 60) return 'fresh';
    if (avgAge < 90) return 'moderate';
    return 'stale';
  }
}

// Función para probar el modelo
async function testEnhancedModel() {
  const model = new EnhancedRentPredictionModel();
  
  const testCase = {
    comuna: 'Las Condes',
    m2: 80,
    tipoPropiedad: 'departamento',
    dormitorios: 2,
    estacionamientos: 1,
    bodega: true
  };
  
  console.log('🧪 Probando modelo ML mejorado...');
  
  try {
    const prediction = await model.generatePrediction(testCase);
    
    console.log('\\n📊 RESULTADOS DEL MODELO MEJORADO:');
    console.log('===============================');
    console.log(`🎯 Rango principal: $${prediction.mainRange.min.toLocaleString()} - $${prediction.mainRange.max.toLocaleString()}`);
    console.log(`📈 Precio predicho: $${prediction.predicted.toLocaleString()}`);
    console.log(`🎪 Más probable: $${prediction.mostLikely.toLocaleString()}`);
    console.log(`📊 Confianza: ${prediction.confidence}%`);
    console.log(`🏪 Condición del mercado: ${prediction.marketCondition}`);
    console.log(`🔄 Frescura de datos: ${prediction.dataQuality.dataFreshness}`);
    console.log(`📊 Muestra: ${prediction.dataQuality.sampleSize} listings`);
    
  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}

// Ejecutar prueba si se llama directamente
if (require.main === module) {
  testEnhancedModel()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

module.exports = { EnhancedRentPredictionModel };