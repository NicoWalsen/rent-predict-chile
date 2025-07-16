# Rent Predictor Chile - Mobile App

Aplicación móvil para predicción de precios de arriendo en Chile, desarrollada con React Native + Expo.

## 🚀 Características

- **Predicción Precisa**: Estimaciones basadas en datos reales del mercado chileno
- **Geolocalización**: Detección automática de comuna
- **Seguridad**: Almacenamiento seguro y validación de inputs
- **Multiplataforma**: iOS y Android desde una sola base de código
- **Offline**: Historial de búsquedas guardado localmente

## 🛠️ Tecnologías

- **React Native** con TypeScript
- **Expo SDK 51**
- **React Navigation** para navegación
- **Expo Location** para geolocalización
- **Expo Secure Store** para almacenamiento seguro
- **API REST** con validación y rate limiting

## 📋 Requisitos

- Node.js 18+
- npm o yarn
- Expo CLI: `npm install -g @expo/cli`
- Para desarrollo iOS: Xcode (macOS)
- Para desarrollo Android: Android Studio

## ⚡ Instalación Rápida

### 1. Instalar dependencias
```bash
cd rent-predictor-app
npm install
```

### 2. Configurar API Backend
```bash
# En el directorio del backend (Next.js)
cd ../
npm run dev  # Backend corriendo en localhost:3003
```

### 3. Ejecutar la app
```bash
# Desarrollo
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web
npm run web
```

## 🔧 Configuración

### Variables de Entorno

Edita `src/constants/config.ts`:

```typescript
const ENV = {
  dev: {
    API_URL: 'http://localhost:3003/api',  // Tu backend local
  },
  prod: {
    API_URL: 'https://tu-api-produccion.com/api',
  },
};
```

### Personalización

- **App Name**: Editar `app.json` → `expo.name`
- **Bundle ID**: Editar `app.json` → `expo.ios.bundleIdentifier` y `expo.android.package`
- **Icons**: Reemplazar archivos en `assets/`

## 🏗️ Build y Deployment

### Build de Desarrollo
```bash
# Preview build
eas build --platform all --profile preview

# Development build
eas build --platform all --profile development
```

### Publicación
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login a Expo
eas login

# Configurar proyecto
eas build:configure

# Build para stores
eas build --platform all --profile production

# Submit a stores
eas submit --platform ios
eas submit --platform android
```

## 🔐 Seguridad

### Medidas Implementadas

1. **Validación de Inputs**: Sanitización y validación en cliente y servidor
2. **Rate Limiting**: Máximo 60 requests por minuto
3. **Secure Storage**: Datos sensibles encriptados localmente
4. **HTTPS Only**: Todas las comunicaciones encriptadas
5. **Error Handling**: Manejo seguro de errores sin exposición de datos

### Configuración de Seguridad

```typescript
// Rate limiting
export const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 60,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
};

// Input validation
export const APP_CONFIG = {
  MIN_M2: 1,
  MAX_M2: 1000,
  MIN_ESTACIONAMIENTOS: 0,
  MAX_ESTACIONAMIENTOS: 10,
};
```

## 📱 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── LoadingSpinner.tsx
│   └── ErrorMessage.tsx
├── screens/            # Pantallas principales
│   ├── HomeScreen.tsx
│   └── PredictionScreen.tsx
├── services/           # Lógica de negocio
│   ├── api.ts         # Cliente API con seguridad
│   ├── location.ts    # Servicios de geolocalización
│   └── storage.ts     # Almacenamiento seguro
├── types/             # Definiciones de tipos
├── constants/         # Configuración y constantes
└── utils/             # Utilidades y helpers
    └─ security.ts     # Funciones de seguridad
```

## 🚀 Features Roadmap

### Fase 1 (Actual)
- ✅ UI básica con predicción
- ✅ Geolocalización
- ✅ Almacenamiento seguro
- ✅ Validación de inputs

### Fase 2 (Próxima)
- [ ] Sistema de usuarios
- [ ] Historial de búsquedas visual
- [ ] Notificaciones push
- [ ] Modo offline completo

### Fase 3 (Futuro)
- [ ] Análisis de inversión
- [ ] Reportes PDF
- [ ] Integración con mapas
- [ ] Funcionalidades premium

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

## 📞 Soporte

- Email: soporte@rentpredictor.cl
- GitHub Issues: [Reportar bug](https://github.com/tu-usuario/rent-predictor/issues)
- Documentación: [Wiki](https://github.com/tu-usuario/rent-predictor/wiki)