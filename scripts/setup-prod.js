const { execSync } = require('child_process');
const fs = require('fs');

// Variables requeridas
const REQUIRED_VARS = {
  DATABASE_URL: "postgresql://postgres:MiClaveSegura@db.edxiveestulqjvflkrhi.supabase.co:5432/postgres",
  NEXT_PUBLIC_SUPABASE_URL: "https://edxiveestulqjvflkrhi.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkeGl2ZWVzdHVscWp2ZmxrcmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MzA4NzksImV4cCI6MjA2NDMwNjg3OX0.CcKzP3X3C1BaLwSXay9X4jHoqxMxzHudiJBiiJmoUC4",
  SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SERVICE_ROLE_PLACEHOLDER"
};

const PROD_URL = 'https://rent-widget.vercel.app';
const ADMIN_KEY = 'TU_PASS';

async function main() {
  console.log('🔍 Verificando producción...\n');

  try {
    // 1. Probar endpoints directamente
    console.log('🔍 Probando endpoints...');
    
    // Predict
    console.log('\nProbando /api/predict...');
    try {
      const predictOutput = execSync(
        `curl -s -w "\\nHTTP:%{http_code}\\n" "${PROD_URL}/api/predict?comuna=Providencia&m2=60"`
      ).toString();
      console.log(predictOutput);
    } catch (error) {
      console.log('Error en /api/predict:', error.message);
    }

    // Predict ML
    console.log('\nProbando /api/predict-ml...');
    try {
      const predictMLOutput = execSync(
        `curl -s -w "\\nHTTP:%{http_code}\\n" "${PROD_URL}/api/predict-ml?comuna=Providencia&m2=60"`
      ).toString();
      console.log(predictMLOutput);
    } catch (error) {
      console.log('Error en /api/predict-ml:', error.message);
    }

    // Widget
    console.log('\nProbando widget...');
    try {
      const widgetOutput = execSync(
        `curl -s "${PROD_URL}/example.html"`
      ).toString();
      const widgetOK = widgetOutput.includes('CLP');
      console.log('Widget:', widgetOK ? '✅ OK' : '❌ FAIL');
    } catch (error) {
      console.log('Error en widget:', error.message);
    }

    // Admin
    console.log('\nProbando /admin...');
    try {
      const adminStatus = execSync(
        `curl -s -o /dev/null -w "%{http_code}" "${PROD_URL}/admin?key=${ADMIN_KEY}"`
      ).toString();
      console.log('Admin:', adminStatus === '200' ? '✅ OK' : '❌ FAIL');
    } catch (error) {
      console.log('Error en /admin:', error.message);
    }

    // 2. Resumen final
    console.log('\n── RESUMEN ──');
    console.log('1. Verifica que las siguientes variables estén configuradas en Vercel:');
    Object.keys(REQUIRED_VARS).forEach(key => {
      console.log(`   - ${key}`);
    });
    console.log('\n2. Para configurar las variables:');
    console.log('   a) Ve a https://vercel.com/dashboard');
    console.log('   b) Selecciona el proyecto rent-widget');
    console.log('   c) Ve a Settings > Environment Variables');
    console.log('   d) Agrega cada variable con su valor correspondiente');
    console.log('\n3. Después de configurar las variables:');
    console.log('   a) Ve a Deployments');
    console.log('   b) Haz clic en "Redeploy" en el último deployment');
    console.log('\n4. Verifica que los endpoints funcionen después del redeploy');

  } catch (error) {
    console.error('Error general:', error.message);
    process.exit(1);
  }
}

main().catch(console.error); 