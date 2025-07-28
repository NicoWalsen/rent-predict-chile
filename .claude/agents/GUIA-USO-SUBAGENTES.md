# 🤖 Guía Completa de Uso de Sub-Agentes Claude Code
## RentPredict Chile - Especialistas IA para Desarrollo

---

## 📋 Índice
1. [¿Qué son los Sub-Agentes?](#qué-son-los-sub-agentes)
2. [Sub-Agentes Disponibles](#sub-agentes-disponibles)
3. [Cómo Invocar Sub-Agentes](#cómo-invocar-sub-agentes)
4. [Casos de Uso Prácticos](#casos-de-uso-prácticos)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Troubleshooting](#troubleshooting)
7. [Aplicación en Otros Proyectos](#aplicación-en-otros-proyectos)

---

## ¿Qué son los Sub-Agentes?

Los sub-agentes son **especialistas IA** configurados con expertise específico para dominios particulares de tu proyecto. Cada uno mantiene su propio contexto, herramientas especializadas, y conocimiento profundo de su área.

### Beneficios Clave:
- 🎯 **Expertise Especializado**: Cada agente es experto en su dominio
- 🧠 **Contexto Preservado**: Mantienen memoria específica de su área
- ⚡ **Respuestas Optimizadas**: Soluciones más precisas y rápidas
- 🔧 **Herramientas Específicas**: Acceso limitado a herramientas relevantes

---

## Sub-Agentes Disponibles

### 1. 🚨 **rent-production-debugger**
**Especialista en**: Errores de producción, debugging serverless, Vercel/Supabase
```
Expertise: Errores 500, connection pooling, timeouts, Prisma client
Herramientas: Bash, Read, WebFetch, Grep, Edit
```

### 2. 📊 **rent-data-engineer** 
**Especialista en**: Gestión de datos, scraping, base de datos PostgreSQL
```
Expertise: 12,108 listings, 5 fuentes de datos, calidad de datos
Herramientas: Bash, Read, Write, Glob, Edit, Grep
```

### 3. 🤖 **rent-ml-optimizer**
**Especialista en**: Modelo ML v2.0, algoritmos de similitud, métricas
```
Expertise: Algoritmo 5-factor, confianza 60-70%, outlier detection
Herramientas: Read, Write, Bash, Edit, Glob
```

### 4. 🏗️ **rent-api-architect**
**Especialista en**: APIs, Next.js routes, arquitectura serverless
```
Expertise: 12 endpoints, rate limiting, Prisma ORM, Vercel optimization
Herramientas: Read, Write, Edit, Bash, Grep
```

### 5. 🔒 **rent-security-auditor**
**Especialista en**: Seguridad, HTTPS, validación, security headers
```
Expertise: SSL certificates, rate limiting, Joi validation, Helmet.js
Herramientas: Read, Grep, Bash, Edit, Write
```

---

## Cómo Invocar Sub-Agentes

### Invocación Automática (Claude decide)
Claude Code automáticamente selecciona el sub-agente apropiado basado en tu consulta:

```
❌ "Tengo un error 500 en producción"
→ Claude invoca automáticamente: rent-production-debugger

❌ "El modelo ML está dando predicciones incorrectas"  
→ Claude invoca automáticamente: rent-ml-optimizer
```

### Invocación Manual (Tú decides)
Puedes solicitar específicamente un sub-agente:

```
✅ "rent-production-debugger: ayúdame con este error en Vercel"
✅ "rent-data-engineer: necesito actualizar el scraper"
✅ "rent-security-auditor: revisa la configuración HTTPS"
```

### Invocación por Contexto
Menciona el dominio específico para activar el sub-agente:

```
✅ "Problemas con el endpoint /api/predict-serverless"
→ Activa: rent-api-architect

✅ "El scraping de Portal Inmobiliario falló"  
→ Activa: rent-data-engineer

✅ "Necesito mejorar la precisión del modelo"
→ Activa: rent-ml-optimizer
```

---

## Casos de Uso Prácticos

### 🚨 **Debugging de Producción**
```
Problema: Error 500 en /api/predict-serverless
Sub-agente: rent-production-debugger

Ejemplo de uso:
"rent-production-debugger: El endpoint principal está fallando en Vercel. 
Los logs muestran 'Connection timeout'. ¿Puedes investigar?"

Respuesta esperada:
- Análisis de connection pooling Supavisor
- Verificación de memoria allocation (3009MB)
- Testing de variables de entorno
- Propuesta de solución específica
```

### 📊 **Gestión de Datos**
```
Problema: Actualizar scraper con nueva fuente
Sub-agente: rent-data-engineer

Ejemplo de uso:
"rent-data-engineer: Quiero agregar ChilePropiedad.cl como sexta fuente 
al enhanced-scraper. ¿Cómo implemento esto?"

Respuesta esperada:
- Análisis de enhanced-scraper.js actual
- Patrón de integración para nueva fuente
- Filtros de calidad aplicables
- Testing y validación de datos
```

### 🤖 **Optimización ML**
```
Problema: Mejorar precisión en comuna específica
Sub-agente: rent-ml-optimizer

Ejemplo de uso:
"rent-ml-optimizer: Las Condes tiene MAE alto ($52,000). 
¿Cómo optimizo el modelo para esta comuna?"

Respuesta esperada:
- Análisis de distribución de datos en Las Condes
- Ajuste de weights en algoritmo 5-factor
- Feature engineering específico
- Testing A/B contra modelo actual
```

### 🏗️ **Arquitectura de APIs**
```
Problema: Crear nuevo endpoint optimizado
Sub-agente: rent-api-architect

Ejemplo de uso:
"rent-api-architect: Necesito un endpoint /api/predict-batch 
para predicciones múltiples. ¿Cómo diseño esto?"

Respuesta esperada:
- Patrón de diseño para batch processing  
- Rate limiting específico para batch
- Optimización de queries Prisma
- Configuración Vercel functions
```

### 🔒 **Auditoría de Seguridad**
```
Problema: Revisar configuración de seguridad
Sub-agente: rent-security-auditor

Ejemplo de uso:
"rent-security-auditor: Voy a lanzar en producción. 
¿Puedes hacer una auditoría completa de seguridad?"

Respuesta esperada:
- Checklist de security headers
- Validación de certificados SSL
- Review de rate limiting
- Recomendaciones de hardening
```

---

## Mejores Prácticas

### ✅ **DO - Buenas Prácticas**

**1. Sé Específico con el Contexto**
```
✅ BIEN: "rent-ml-optimizer: El modelo v2.0 tiene MAE $45,000 en Santiago 
pero $65,000 en Maipú. ¿Cómo balanzo esto?"

❌ MAL: "Ayúdame con el modelo ML"
```

**2. Proporciona Datos Relevantes**
```
✅ BIEN: "rent-production-debugger: Error 500 en predict-serverless, 
logs muestran 'Connection pool exhausted', 15:30 UTC"

❌ MAL: "Hay un error en producción"
```

**3. Combina Sub-Agentes Cuando Sea Apropiado**
```
✅ BIEN: Primero rent-production-debugger para diagnosticar, 
luego rent-api-architect para implementar fix
```

**4. Usa el Sub-Agente Correcto para el Task**
```
✅ rent-data-engineer → Problemas de datos/scraping
✅ rent-ml-optimizer → Algoritmos y predicciones
✅ rent-api-architect → Endpoints y arquitectura
✅ rent-security-auditor → Seguridad y compliance
✅ rent-production-debugger → Errores en vivo
```

### ❌ **DON'T - Malas Prácticas**

**1. No Uses Sub-Agentes para Tasks Generales**
```
❌ "rent-ml-optimizer: ¿Cómo instalo npm packages?"
→ Esto no es específico a ML, usa Claude general
```

**2. No Cambies de Sub-Agente Sin Contexto**
```
❌ Invocar rent-security-auditor cuando el problema es de datos
→ Cada sub-agente está optimizado para su dominio
```

**3. No Proporciones Información Irrelevante**
```
❌ "rent-data-engineer: Mi UI no se ve bien y también el scraper falla"
→ Enfócate en el dominio del sub-agente
```

---

## Workflow de Colaboración Entre Sub-Agentes

### Ejemplo: Resolver Error de Producción Completo

**Paso 1: Diagnóstico**
```
Usuario: "Error 500 en /api/predict-serverless desde hace 2 horas"
→ Invoca: rent-production-debugger
→ Outcome: "Connection pooling issue, necesita optimización de API"
```

**Paso 2: Solución Arquitectural**
```
Usuario: "rent-api-architect: Implementa la solución sugerida por production-debugger"
→ Invoca: rent-api-architect  
→ Outcome: "API optimizada, pero queries de ML son lentas"
```

**Paso 3: Optimización ML**
```
Usuario: "rent-ml-optimizer: Optimiza queries identificadas por api-architect"
→ Invoca: rent-ml-optimizer
→ Outcome: "Queries optimizadas, pero hay un security concern"
```

**Paso 4: Validación de Seguridad**
```
Usuario: "rent-security-auditor: Valida cambios implementados"
→ Invoca: rent-security-auditor
→ Outcome: "Todo seguro, solución completa implementada"
```

---

## Troubleshooting

### Problema: Sub-Agente No Se Activa
**Síntomas**: Claude no invoca el sub-agente apropiado
**Solución**: 
```
1. Sé más específico: menciona el nombre del sub-agente
2. Usa contexto relevante: menciona tecnologías específicas
3. Invocación manual: "rent-[nombre]: tu pregunta"
```

### Problema: Respuesta No Es Específica
**Síntomas**: El sub-agente da respuestas genéricas
**Solución**:
```
1. Proporciona más contexto del proyecto RentPredict
2. Menciona archivos/endpoints específicos
3. Incluye logs de error o métricas relevantes
```

### Problema: Sub-Agente Incorrecto Se Activa
**Síntomas**: Se activa un sub-agente diferente al esperado
**Solución**:
```
1. Usa invocación manual explícita
2. Reformula la pregunta con contexto más específico
3. Inicia nueva conversación si el contexto se contamina
```

---

## Aplicación en Otros Proyectos

### 🎯 **Cómo Adaptar a Tu Proyecto**

**1. Identifica Dominios Principales**
```
Ejemplo para E-commerce:
- ecommerce-payment-specialist
- ecommerce-inventory-manager  
- ecommerce-analytics-expert
- ecommerce-security-auditor
```

**2. Define Expertise Específico**
```
Para cada dominio, define:
- Tecnologías específicas (Stripe, Shopify, etc.)
- Problemas comunes (payment failures, stock issues)
- Herramientas necesarias (APIs, databases, etc.)
- Contexto del negocio (productos, usuarios, métricas)
```

**3. Crea Archivos de Sub-Agentes**
```
.claude/agents/
├── ecommerce-payment-specialist.md
├── ecommerce-inventory-manager.md
├── ecommerce-analytics-expert.md
└── ecommerce-security-auditor.md
```

### 📋 **Template para Nuevo Sub-Agente**
```markdown
---
name: tu-proyecto-especialista
description: Descripción específica del expertise
tools:
  - Read
  - Write
  - Bash
  - Edit
---

# Tu Proyecto Especialista

Soy tu especialista en [dominio específico] para [nombre proyecto].

## Mi Especialización
- Expertise 1: Descripción detallada
- Expertise 2: Descripción detallada  
- Expertise 3: Descripción detallada

## Contexto del Proyecto
- Tecnologías principales
- Arquitectura actual
- Problemas comunes
- Métricas importantes

## Protocolos de Trabajo
1. Diagnóstico approach
2. Solution patterns
3. Testing strategies
4. Monitoring practices

Cuando me invoques, [instrucciones específicas].
```

---

## 🎓 Conclusión

Los sub-agentes de Claude Code transforman tu workflow de desarrollo en RentPredict Chile, proporcionando expertise especializado para cada dominio crítico. 

**Recuerda**:
- 🎯 Usa el sub-agente apropiado para cada task
- 🧠 Proporciona contexto específico y relevante  
- 🔧 Combina sub-agentes para soluciones complejas
- 📊 Adapta el patrón a otros proyectos similares

**¡Los sub-agentes están listos para ayudarte a hacer crecer RentPredict Chile de manera más eficiente y profesional!**

---

*Última actualización: Julio 2025 | RentPredict Chile v2.0*