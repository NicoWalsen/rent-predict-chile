// Simular exactamente lo que hace la aplicación web
async function testRealPrediction() {
  console.log('🧪 Probando predicción real - Casa vs Departamento\n');
  
  const baseUrl = 'https://localhost:3008';
  const testParams = {
    comuna: 'Las Condes',
    m2: '60',
    estacionamientos: '0',
    bodega: 'false',
    dormitorios: '2'
  };
  
  // Test para DEPARTAMENTO
  const deptoParams = new URLSearchParams({
    ...testParams,
    tipoPropiedad: 'departamento'
  });
  
  // Test para CASA  
  const casaParams = new URLSearchParams({
    ...testParams,
    tipoPropiedad: 'casa'
  });
  
  console.log('📡 Simulando llamadas a la API...');
  console.log(`🏢 Departamento: /api/predict?${deptoParams.toString()}`);
  console.log(`🏠 Casa: /api/predict?${casaParams.toString()}\n`);
  
  try {
    // Fetch para departamento
    console.log('🏢 CONSULTANDO DEPARTAMENTO...');
    const deptoResponse = await fetch(`${baseUrl}/api/predict?${deptoParams.toString()}`, {
      headers: { 'User-Agent': 'RentPredict-Test' }
    });
    const deptoData = await deptoResponse.json();
    
    console.log(`✅ Respuesta departamento:`);
    console.log(`   Promedio: ${deptoData.avgFmt}`);
    console.log(`   Rango: ${deptoData.minFmt} - ${deptoData.maxFmt}`);
    console.log(`   P25: ${deptoData.p25Fmt}, P50: ${deptoData.p50Fmt}, P75: ${deptoData.p75Fmt}\n`);
    
    // Fetch para casa
    console.log('🏠 CONSULTANDO CASA...');
    const casaResponse = await fetch(`${baseUrl}/api/predict?${casaParams.toString()}`, {
      headers: { 'User-Agent': 'RentPredict-Test' }
    });
    const casaData = await casaResponse.json();
    
    console.log(`✅ Respuesta casa:`);
    console.log(`   Promedio: ${casaData.avgFmt}`);
    console.log(`   Rango: ${casaData.minFmt} - ${casaData.maxFmt}`);
    console.log(`   P25: ${casaData.p25Fmt}, P50: ${casaData.p50Fmt}, P75: ${casaData.p75Fmt}\n`);
    
    // Comparar resultados
    console.log('='.repeat(60));
    console.log('📊 COMPARACIÓN:');
    
    const deptoAvg = deptoData.avg;
    const casaAvg = casaData.avg;
    const diferencia = casaAvg - deptoAvg;
    const porcentaje = ((diferencia / deptoAvg) * 100).toFixed(1);
    
    console.log(`💰 Diferencia promedio: CLP ${diferencia.toLocaleString('es-CL')} (${porcentaje}%)`);
    
    if (Math.abs(diferencia) < 50000) {
      console.log('❌ PROBLEMA: Diferencia muy pequeña - algoritmo no está funcionando');
      console.log('🔍 Revisar parámetros o lógica de la API');
    } else {
      console.log('✅ CORRECTO: Diferencia significativa detectada');
      console.log(`📈 ${diferencia > 0 ? 'Casas más caras' : 'Departamentos más caros'} como se esperaba`);
    }
    
  } catch (error) {
    console.error('❌ Error en test:', error.message);
    console.log('\n💡 Asegúrate de que el servidor HTTPS esté corriendo:');
    console.log('   npm run dev:https');
  }
}

// Ejecutar test usando fetch nativo de Node.js 18+
if (typeof fetch !== 'undefined') {
  testRealPrediction();
} else {
  console.log('❌ Node.js 18+ requerido para fetch nativo');
  console.log('💡 Alternativamente, ejecuta este test en el navegador:');
  console.log('   1. Abre las DevTools (F12)');
  console.log('   2. Pega este código en la consola');
  console.log('   3. Llama a testRealPrediction()');
}