import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { rateLimit, getClientIP, validateInput, sanitizeOutput, logSecurityEvent } from '../../../lib/security';

const prisma = new PrismaClient();

// Importar modelo ML mejorado
const { EnhancedRentPredictionModel } = require('../../../../scripts/enhanced-ml-model.js');

// Helper para formatear CLP
const clp = (n: number) => 'CLP ' + n.toLocaleString('es-CL');

// Instancia del modelo mejorado
const mlModel = new EnhancedRentPredictionModel();

export async function POST(request: Request) {
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(30, 60 * 1000, `post_enhanced_${clientIP}`);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { method: 'POST', endpoint: 'predict-enhanced' }, clientIP);
      return NextResponse.json(
        { 
          error: 'Demasiadas solicitudes. Intenta nuevamente en un minuto.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      );
    }
    
    const body = await request.json();
    
    // Validación de entrada
    const validation = validateInput(body);
    if (!validation.isValid) {
      logSecurityEvent('INVALID_INPUT', { errors: validation.errors, input: body }, clientIP);
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          details: validation.errors
        },
        { status: 400 }
      );
    }
    
    const { comuna, m2, estacionamientos, bodega, tipoPropiedad, dormitorios } = validation.data;
    
    console.log('🚀 PREDICCIÓN MEJORADA - Datos recibidos:');
    console.log(`  📍 Comuna: ${comuna}`);
    console.log(`  📐 M2: ${m2}`);
    console.log(`  🏠 Tipo: ${tipoPropiedad}`);
    console.log(`  🛏️ Dormitorios: ${dormitorios}`);
    console.log(`  🚗 Estacionamientos: ${estacionamientos}`);
    console.log(`  📦 Bodega: ${bodega}`);
    
    // Preparar datos para el modelo ML
    const targetProperty = {
      comuna,
      m2: parseInt(m2.toString()),
      tipoPropiedad,
      dormitorios: parseInt(dormitorios.toString()),
      estacionamientos: parseInt(estacionamientos.toString()),
      bodega: bodega === true || bodega === 'true'
    };
    
    // Generar predicción usando modelo mejorado
    const prediction = await mlModel.generatePrediction(targetProperty);
    
    // Formatear respuesta con datos mejorados
    const responseData = {
      // Valores principales
      min: prediction.mainRange.min,
      max: prediction.mainRange.max,
      avg: prediction.predicted,
      predicted_price: prediction.predicted,
      median: prediction.median,
      mostLikely: prediction.mostLikely,
      
      // Percentiles completos
      percentiles: {
        p10: prediction.percentiles.p10,
        p25: prediction.percentiles.p25,
        p50: prediction.percentiles.p50,
        p75: prediction.percentiles.p75,
        p90: prediction.percentiles.p90
      },
      
      // Versiones formateadas
      minFmt: clp(prediction.mainRange.min),
      maxFmt: clp(prediction.mainRange.max),
      avgFmt: clp(prediction.predicted),
      predictedFmt: clp(prediction.predicted),
      medianFmt: clp(prediction.median),
      mostLikelyFmt: clp(prediction.mostLikely),
      
      p10Fmt: clp(prediction.percentiles.p10),
      p25Fmt: clp(prediction.percentiles.p25),
      p50Fmt: clp(prediction.percentiles.p50),
      p75Fmt: clp(prediction.percentiles.p75),
      p90Fmt: clp(prediction.percentiles.p90),
      
      // Rangos
      mainRange: {
        min: prediction.mainRange.min,
        max: prediction.mainRange.max,
        minFmt: clp(prediction.mainRange.min),
        maxFmt: clp(prediction.mainRange.max)
      },
      
      extendedRange: {
        min: prediction.extendedRange.min,
        max: prediction.extendedRange.max,
        minFmt: clp(prediction.extendedRange.min),
        maxFmt: clp(prediction.extendedRange.max)
      },
      
      // Metadata de entrada
      comuna,
      m2: targetProperty.m2,
      tipoPropiedad,
      dormitorios: targetProperty.dormitorios,
      estacionamientos: targetProperty.estacionamientos,
      bodega: targetProperty.bodega,
      
      // Métricas de calidad mejoradas
      sample_size: prediction.dataQuality.sampleSize,
      confidence: prediction.confidence,
      market_condition: prediction.marketCondition,
      
      // Información de calidad de datos
      dataQuality: {
        sampleSize: prediction.dataQuality.sampleSize,
        originalListings: prediction.dataQuality.originalListings,
        outliersRemoved: prediction.dataQuality.outliersRemoved,
        avgSimilarity: Math.round(prediction.dataQuality.avgSimilarity * 100) / 100,
        dispersion: Math.round(prediction.dataQuality.dispersion * 100) / 100,
        dataFreshness: prediction.dataQuality.dataFreshness,
        lastUpdated: new Date().toISOString().split('T')[0],
        sources: 'multiple_enhanced',
        modelVersion: '2.0',
        algorithm: 'enhanced_ml_similarity'
      },
      
      // Información adicional
      priceRange: {
        tight: `${clp(prediction.percentiles.p25)} - ${clp(prediction.percentiles.p75)}`,
        normal: `${clp(prediction.percentiles.p10)} - ${clp(prediction.percentiles.p90)}`,
        wide: `${clp(prediction.extendedRange.min)} - ${clp(prediction.extendedRange.max)}`
      },
      
      // Recomendaciones
      recommendations: {
        confidence: prediction.confidence >= 80 ? 'high' : prediction.confidence >= 60 ? 'medium' : 'low',
        suggestion: prediction.confidence >= 80 ? 
          'Esta predicción es muy confiable' : 
          prediction.confidence >= 60 ? 
            'Esta predicción es moderadamente confiable' : 
            'Esta predicción tiene baja confianza, considera expandir la búsqueda',
        marketNote: {
          'stable': 'Mercado estable con poca variabilidad',
          'moderate': 'Mercado con variabilidad moderada',
          'volatile': 'Mercado volátil con alta variabilidad',
          'highly_volatile': 'Mercado muy volátil, precios muy variables'
        }[prediction.marketCondition]
      }
    };
    
    // Sanitizar salida
    const sanitizedResponse = sanitizeOutput(responseData);
    
    // Log de éxito
    logSecurityEvent('ENHANCED_PREDICTION_SUCCESS', { 
      comuna, 
      m2, 
      confidence: prediction.confidence,
      sampleSize: prediction.dataQuality.sampleSize 
    }, clientIP);
    
    console.log('✅ PREDICCIÓN MEJORADA COMPLETADA:');
    console.log(`  💰 Rango principal: ${responseData.minFmt} - ${responseData.maxFmt}`);
    console.log(`  🎯 Predicción: ${responseData.predictedFmt}`);
    console.log(`  📊 Confianza: ${prediction.confidence}%`);
    console.log(`  📈 Muestra: ${prediction.dataQuality.sampleSize} listings`);
    console.log(`  🏪 Mercado: ${prediction.marketCondition}`);
    
    return NextResponse.json(sanitizedResponse, {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-Model-Version': '2.0',
        'X-Confidence': prediction.confidence.toString(),
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    });
    
  } catch (error) {
    console.error('❌ Error en predicción mejorada:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    // Log de error
    logSecurityEvent('ENHANCED_PREDICTION_ERROR', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, clientIP);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la predicción mejorada',
        details: error instanceof Error ? error.message : 'Error desconocido',
        modelVersion: '2.0'
      },
      { status: 500 }
    );
  }
}

// GET para compatibilidad
export async function GET(request: Request) {
  const clientIP = getClientIP(request);
  
  try {
    console.log('🔍 GET /api/predict-enhanced - Request received');
    
    // Rate limiting
    const rateLimitResult = rateLimit(60, 60 * 1000, `get_enhanced_${clientIP}`);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { method: 'GET', endpoint: 'predict-enhanced' }, clientIP);
      return NextResponse.json(
        { 
          error: 'Demasiadas solicitudes. Intenta nuevamente en un minuto.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
          }
        }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);
    
    console.log('📊 Query params:', queryParams);
    
    // Validar parámetros
    const validation = validateInput(queryParams);
    if (!validation.isValid) {
      logSecurityEvent('INVALID_INPUT', { errors: validation.errors, input: queryParams }, clientIP);
      return NextResponse.json(
        { 
          error: 'Parámetros inválidos',
          details: validation.errors
        },
        { status: 400 }
      );
    }
    
    const { comuna, m2, estacionamientos, bodega, tipoPropiedad, dormitorios } = validation.data;
    
    // Preparar datos
    const targetProperty = {
      comuna,
      m2: parseInt(m2.toString()),
      tipoPropiedad,
      dormitorios: parseInt(dormitorios.toString()),
      estacionamientos: parseInt(estacionamientos.toString()),
      bodega: bodega === true || bodega === 'true'
    };
    
    // Generar predicción
    const prediction = await mlModel.generatePrediction(targetProperty);
    
    // Formatear respuesta similar al POST
    const responseData = {
      min: prediction.mainRange.min,
      max: prediction.mainRange.max,
      avg: prediction.predicted,
      predicted_price: prediction.predicted,
      median: prediction.median,
      mostLikely: prediction.mostLikely,
      
      percentiles: {
        p10: prediction.percentiles.p10,
        p25: prediction.percentiles.p25,
        p50: prediction.percentiles.p50,
        p75: prediction.percentiles.p75,
        p90: prediction.percentiles.p90
      },
      
      minFmt: clp(prediction.mainRange.min),
      maxFmt: clp(prediction.mainRange.max),
      avgFmt: clp(prediction.predicted),
      predictedFmt: clp(prediction.predicted),
      medianFmt: clp(prediction.median),
      mostLikelyFmt: clp(prediction.mostLikely),
      
      p10Fmt: clp(prediction.percentiles.p10),
      p25Fmt: clp(prediction.percentiles.p25),
      p50Fmt: clp(prediction.percentiles.p50),
      p75Fmt: clp(prediction.percentiles.p75),
      p90Fmt: clp(prediction.percentiles.p90),
      
      comuna,
      m2: targetProperty.m2,
      tipoPropiedad,
      dormitorios: targetProperty.dormitorios,
      estacionamientos: targetProperty.estacionamientos,
      bodega: targetProperty.bodega,
      
      sample_size: prediction.dataQuality.sampleSize,
      confidence: prediction.confidence,
      market_condition: prediction.marketCondition,
      
      dataQuality: {
        sampleSize: prediction.dataQuality.sampleSize,
        confidence: prediction.confidence,
        modelVersion: '2.0',
        algorithm: 'enhanced_ml_similarity',
        lastUpdated: new Date().toISOString().split('T')[0]
      }
    };
    
    const sanitizedResponse = sanitizeOutput(responseData);
    
    logSecurityEvent('ENHANCED_PREDICTION_SUCCESS', { 
      comuna, 
      m2, 
      method: 'GET',
      confidence: prediction.confidence 
    }, clientIP);
    
    return NextResponse.json(sanitizedResponse, {
      headers: {
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-Model-Version': '2.0',
        'X-Confidence': prediction.confidence.toString(),
        'Cache-Control': 'public, max-age=300, s-maxage=300'
      }
    });
    
  } catch (error) {
    console.error('❌ Error en GET predict-enhanced:', error);
    
    logSecurityEvent('ENHANCED_PREDICTION_ERROR', { 
      method: 'GET',
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, clientIP);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la predicción mejorada',
        details: error instanceof Error ? error.message : 'Error desconocido',
        modelVersion: '2.0'
      },
      { status: 500 }
    );
  }
}