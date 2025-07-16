import config, { RATE_LIMIT } from '../constants/config';
import { 
  PredictionResponse, 
  ComunasResponse, 
  PredictionRequest, 
  ApiError 
} from '../types';
import { 
  validateInput, 
  sanitizeString, 
  generateRequestId, 
  isRateLimited,
  safeJsonParse 
} from '../utils/security';

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = config.API_URL;
    this.timeout = config.API_TIMEOUT;
  }

  // Security: Create secure request headers
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'User-Agent': 'RentPredictorApp/1.0.0',
      'X-Request-ID': generateRequestId(),
      'X-Timestamp': Date.now().toString(),
    };
  }

  // Security: Make secure HTTP request with timeout and error handling
  private async secureRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    // Security: Check rate limiting
    if (isRateLimited()) {
      throw new Error('Demasiadas solicitudes. Intenta nuevamente en un minuto.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        const error = safeJsonParse<ApiError>(errorText, { 
          error: 'Error de conexión',
          status: response.status 
        });
        throw new Error(error.error || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data as T;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Tiempo de espera agotado. Verifica tu conexión.');
        }
        throw error;
      }
      
      throw new Error('Error desconocido en la conexión.');
    }
  }

  // Security: Validate and get comunas list
  async getComunas(): Promise<string[]> {
    try {
      const response = await this.secureRequest<ComunasResponse>('/comunas');
      
      // Security: Validate response structure
      if (!response.comunas || !Array.isArray(response.comunas)) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Security: Sanitize comunas names
      return response.comunas
        .map(comuna => sanitizeString(comuna))
        .filter(comuna => validateInput.comuna(comuna));

    } catch (error) {
      console.error('Error fetching comunas:', error);
      throw error;
    }
  }

  // Security: Validate and get prediction
  async getPrediction(request: PredictionRequest): Promise<PredictionResponse> {
    try {
      // Security: Validate all inputs before sending
      if (!validateInput.comuna(request.comuna)) {
        throw new Error('Comuna inválida');
      }
      if (!validateInput.m2(request.m2)) {
        throw new Error('Metros cuadrados inválidos (1-1000)');
      }
      if (!validateInput.estacionamientos(request.estacionamientos)) {
        throw new Error('Número de estacionamientos inválido');
      }
      if (!validateInput.bodega(request.bodega)) {
        throw new Error('Valor de bodega inválido');
      }

      // Security: Sanitize string inputs
      const sanitizedRequest = {
        ...request,
        comuna: sanitizeString(request.comuna),
      };

      // Build query string
      const params = new URLSearchParams({
        comuna: sanitizedRequest.comuna,
        m2: sanitizedRequest.m2.toString(),
        estacionamientos: sanitizedRequest.estacionamientos.toString(),
        bodega: sanitizedRequest.bodega.toString(),
      });

      const response = await this.secureRequest<PredictionResponse>(
        `/predict?${params.toString()}`
      );

      // Security: Validate response structure
      if (typeof response.min !== 'number' || 
          typeof response.max !== 'number' ||
          !response.comuna || 
          !response.minFmt) {
        throw new Error('Respuesta inválida del servidor');
      }

      return response;

    } catch (error) {
      console.error('Error getting prediction:', error);
      throw error;
    }
  }

  // Security: Health check endpoint
  async healthCheck(): Promise<boolean> {
    try {
      await this.secureRequest('/health', { method: 'GET' });
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;