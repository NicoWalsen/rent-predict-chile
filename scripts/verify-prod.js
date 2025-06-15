const fetch = require('node-fetch');

const PROD_URL = 'https://rent-widget.vercel.app';
const ADMIN_KEY = 'TU_PASS'; // Cambiar por tu key

async function checkEndpoint(path, params = '') {
  try {
    const response = await fetch(`${PROD_URL}${path}${params}`);
    const status = response.status;
    const data = await response.json();
    return { status, data };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

async function checkWidget() {
  try {
    const response = await fetch(`${PROD_URL}/example.html`);
    const html = await response.text();
    return html.includes('CLP');
  } catch (error) {
    return false;
  }
}

async function checkAdmin() {
  try {
    const response = await fetch(`${PROD_URL}/admin?key=${ADMIN_KEY}`);
    return response.status;
  } catch (error) {
    return 500;
  }
}

async function main() {
  console.log('🔍 Verificando producción...\n');

  // 1. Endpoint predict
  const predict = await checkEndpoint('/api/predict', '?comuna=Providencia&m2=60');
  console.log('1. /api/predict:');
  console.log(`   Status: ${predict.status}`);
  console.log(`   Data: ${JSON.stringify(predict.data)}\n`);

  // 2. Endpoint predict-ml
  const predictML = await checkEndpoint('/api/predict-ml', '?comuna=Providencia&m2=60');
  console.log('2. /api/predict-ml:');
  console.log(`   Status: ${predictML.status}`);
  console.log(`   Data: ${JSON.stringify(predictML.data)}\n`);

  // 3. Widget
  const widgetOK = await checkWidget();
  console.log('3. Widget:');
  console.log(`   Status: ${widgetOK ? 'OK' : 'FAIL'}\n`);

  // 4. Admin panel
  const adminStatus = await checkAdmin();
  console.log('4. Admin panel:');
  console.log(`   Status: ${adminStatus}\n`);

  // Resumen
  console.log('── RESUMEN ──');
  console.log(`Predict: ${predict.status === 200 ? '✅' : '❌'}`);
  console.log(`Predict-ML: ${predictML.status === 200 ? '✅' : '❌'}`);
  console.log(`Widget: ${widgetOK ? '✅' : '❌'}`);
  console.log(`Admin: ${adminStatus === 200 ? '✅' : '❌'}`);

  // Verificar si todo está OK
  const allOK = predict.status === 200 && 
                predictML.status === 200 && 
                widgetOK && 
                adminStatus === 200;

  if (allOK) {
    console.log('\n✅ TODO OK');
  } else {
    console.log('\n❌ Alguna verificación falló');
  }
}

main().catch(console.error); 