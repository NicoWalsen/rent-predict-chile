/** @type {import('next').NextConfig} */
const nextConfig = {
  // Opciones de configuración aquí
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  
  // Excluir directorios del build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  experimental: {
    externalDir: true,
  },
  
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Excluir directorios innecesarios del build
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    
    // Ignorar archivos específicos que causan problemas
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /rent-predictor-app/,
      use: 'ignore-loader'
    });
    
    return config;
  },
  // Security headers and CORS configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          // CORS headers
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Allow all origins for development
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          // Security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          // Security headers for all pages
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: http: ws: wss:;",
          },
        ],
      },
    ];
  },
  // Excluir rutas específicas del prerenderizado
  async rewrites() {
    return [
      {
        source: '/api/admin-data',
        destination: '/api/admin-data',
      },
    ];
  },
};

module.exports = nextConfig; 