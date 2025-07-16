// API Response Types
export interface PredictionResponse {
  min: number;
  max: number;
  avg: number;
  p25: number;
  p50: number;
  p75: number;
  minFmt: string;
  maxFmt: string;
  avgFmt: string;
  p25Fmt: string;
  p50Fmt: string;
  p75Fmt: string;
  count: number;
  comuna: string;
  m2: number;
}

export interface ComunasResponse {
  comunas: string[];
}

export interface ApiError {
  error: string;
  status?: number;
}

// Form Data Types
export interface PredictionRequest {
  comuna: string;
  m2: number;
  estacionamientos: number;
  bodega: boolean;
}

// UI State Types
export interface PredictionState {
  data: PredictionResponse | null;
  loading: boolean;
  error: string | null;
}

export interface ComunasState {
  data: string[];
  loading: boolean;
  error: string | null;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Prediction: undefined;
  Results: { prediction: PredictionResponse };
};

// Security Types
export interface RequestMetadata {
  timestamp: number;
  userAgent: string;
  requestId: string;
}