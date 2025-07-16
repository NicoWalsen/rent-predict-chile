const https = require('https');
const fs = require('fs');

console.log('🔍 Verificando servidor HTTPS...');

// Permitir certificados autofirmados para testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const testUrls = [
  'https://localhost:3007',
  'https://192.168.100.145:3007',
  'https://192.168.100.143:3007'
];

async function testUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      console.log(`✅ ${url} - Status: ${res.statusCode}`);
      console.log(`   Headers de seguridad:`);
      console.log(`   - X-Frame-Options: ${res.headers['x-frame-options'] || 'No configurado'}`);
      console.log(`   - X-Content-Type-Options: ${res.headers['x-content-type-options'] || 'No configurado'}`);
      console.log(`   - X-XSS-Protection: ${res.headers['x-xss-protection'] || 'No configurado'}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ ${url} - Error: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ ${url} - Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de conectividad...\n');
  
  for (const url of testUrls) {
    await testUrl(url);
    console.log('');
  }
  
  console.log('📱 Para acceder desde móvil:');
  console.log('1. Conecta tu dispositivo a la misma red WiFi');
  console.log('2. Abre el navegador móvil');
  console.log('3. Ve a: https://192.168.100.145:3007');
  console.log('4. Acepta el certificado (Avanzado > Continuar)');
  console.log('');
  console.log('💻 Para acceder desde desktop:');
  console.log('1. Abre tu navegador');
  console.log('2. Ve a: https://localhost:3007');
  console.log('3. Acepta el certificado');
}

if (require.main === module) {
  runTests();
}

module.exports = { testUrl, runTests };