import Constants from 'expo-constants';

// Security: Use environment variables for API configuration
const ENV = {
  dev: {
    API_URL: 'http://localhost:3003/api',
    API_TIMEOUT: 10000,
  },
  staging: {
    API_URL: 'https://your-staging-api.vercel.app/api',
    API_TIMEOUT: 15000,
  },
  prod: {
    API_URL: 'https://your-production-api.vercel.app/api',
    API_TIMEOUT: 15000,
  },
};

// Security: Determine environment based on release channel
const getEnvVars = () => {
  if (__DEV__) return ENV.dev;
  if (Constants.expoConfig?.releaseChannel === 'staging') return ENV.staging;
  return ENV.prod;
};

export default getEnvVars();

// Security: Rate limiting configuration
export const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 60,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
};

// App configuration
export const APP_CONFIG = {
  VERSION: '1.0.0',
  MIN_M2: 1,
  MAX_M2: 1000,
  MIN_ESTACIONAMIENTOS: 0,
  MAX_ESTACIONAMIENTOS: 10,
};