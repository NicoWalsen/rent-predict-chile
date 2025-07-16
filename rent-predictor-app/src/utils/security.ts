import { APP_CONFIG } from '../constants/config';

// Security: Input validation utilities
export const validateInput = {
  comuna: (value: string): boolean => {
    return typeof value === 'string' && 
           value.length > 0 && 
           value.length <= 50 &&
           /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(value); // Only letters and spaces
  },

  m2: (value: number): boolean => {
    return typeof value === 'number' && 
           !isNaN(value) &&
           value >= APP_CONFIG.MIN_M2 && 
           value <= APP_CONFIG.MAX_M2;
  },

  estacionamientos: (value: number): boolean => {
    return typeof value === 'number' && 
           !isNaN(value) &&
           Number.isInteger(value) &&
           value >= APP_CONFIG.MIN_ESTACIONAMIENTOS && 
           value <= APP_CONFIG.MAX_ESTACIONAMIENTOS;
  },

  bodega: (value: boolean): boolean => {
    return typeof value === 'boolean';
  }
};

// Security: Sanitize string inputs
export const sanitizeString = (input: string): string => {
  return input.trim()
              .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
              .substring(0, 100); // Limit length
};

// Security: Generate unique request ID for tracking
export const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Security: Check if request should be rate limited
const requestHistory: number[] = [];
export const isRateLimited = (): boolean => {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Remove old requests
  const recentRequests = requestHistory.filter(time => time > oneMinuteAgo);
  requestHistory.length = 0;
  requestHistory.push(...recentRequests, now);
  
  return requestHistory.length > 60; // 60 requests per minute limit
};

// Security: Safe JSON parsing
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch {
    return fallback;
  }
};