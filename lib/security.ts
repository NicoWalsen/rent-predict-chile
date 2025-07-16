import Joi from 'joi';

// Rate limiting store simple en memoria
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Limpiar contadores antiguos cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(
  maxRequests: number = 60,
  windowMs: number = 60 * 1000, // 1 minuto
  key: string = 'default'
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  
  const current = requestCounts.get(key) || { count: 0, resetTime: now + windowMs };
  
  // Reset si el tiempo ha pasado
  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + windowMs;
  }
  
  current.count++;
  requestCounts.set(key, current);
  
  return {
    allowed: current.count <= maxRequests,
    remaining: Math.max(0, maxRequests - current.count),
    resetTime: current.resetTime
  };
}

export function getClientIP(request: Request): string {
  // Extraer IP del request (simplificado para desarrollo)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddress = forwarded || realIP || 'unknown';
  
  if (typeof remoteAddress === 'string') {
    return remoteAddress.split(',')[0].trim();
  }
  
  return 'unknown';
}

// Esquemas de validación
export const predictInputSchema = Joi.object({
  comuna: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Comuna contiene caracteres inválidos',
      'string.min': 'Comuna debe tener al menos 3 caracteres',
      'string.max': 'Comuna no puede exceder 50 caracteres'
    }),
    
  m2: Joi.number()
    .integer()
    .min(20)
    .max(1000)
    .required()
    .messages({
      'number.min': 'Metros cuadrados debe ser al menos 20',
      'number.max': 'Metros cuadrados no puede exceder 1000'
    }),
    
  tipoPropiedad: Joi.string()
    .valid('departamento', 'casa')
    .default('departamento')
    .messages({
      'any.only': 'Tipo de propiedad debe ser "departamento" o "casa"'
    }),
    
  dormitorios: Joi.number()
    .integer()
    .min(1)
    .max(15)
    .default(2)
    .messages({
      'number.min': 'Dormitorios debe ser al menos 1',
      'number.max': 'Dormitorios no puede exceder 15'
    }),
    
  estacionamientos: Joi.number()
    .integer()
    .min(0)
    .max(10)
    .default(0)
    .messages({
      'number.min': 'Estacionamientos no puede ser negativo',
      'number.max': 'Estacionamientos no puede exceder 10'
    }),
    
  bodega: Joi.boolean()
    .default(false)
});

export function validateInput(data: unknown) {
  const { error, value } = predictInputSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return {
      isValid: false,
      errors: errorDetails,
      data: null
    };
  }
  
  return {
    isValid: true,
    errors: [],
    data: value
  };
}

// Sanitización de salida
export function sanitizeOutput(data: unknown): unknown {
  if (typeof data === 'string') {
    return data.replace(/[<>\"'&]/g, '');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeOutput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof key === 'string' && key.length < 100) {
        sanitized[key] = sanitizeOutput(value);
      }
    }
    return sanitized;
  }
  
  return data;
}

// Logging de seguridad
export function logSecurityEvent(event: string, details: unknown, ip: string) {
  const timestamp = new Date().toISOString();
  console.log(`🔒 SECURITY [${timestamp}] ${event} from ${ip}:`, JSON.stringify(details));
  
  // En producción, esto se enviaría a un sistema de monitoreo
  if (process.env.NODE_ENV === 'production') {
    // TODO: Enviar a servicio de logging (DataDog, LogRocket, etc.)
  }
}