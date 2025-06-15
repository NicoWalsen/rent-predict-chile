const { execSync } = require('child_process');
const fs = require('fs');

const REQUIRED_VARS = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

async function main() {
  console.log('🔍 Verificando variables de entorno...\n');

  try {
    // Obtener variables actuales
    const envOutput = execSync('vercel env ls rent-widget --prod --json').toString();
    const envs = JSON.parse(envOutput).envs;
    
    console.log('Variables actuales:');
    envs.forEach(env => {
      console.log(`${env.key}=${env.value ? '***' : 'undefined'}`);
    });

    // Verificar variables faltantes
    const missingVars = REQUIRED_VARS.filter(varName => 
      !envs.some(env => env.key === varName)
    );

    if (missingVars.length > 0) {
      console.log('\n❌ Variables faltantes:');
      missingVars.forEach(varName => {
        console.log(`- ${varName}`);
      });

      // Verificar si tenemos los valores localmente
      const missingValues = missingVars.filter(varName => !process.env[varName]);
      
      if (missingValues.length > 0) {
        console.log('\n❌ Valores faltantes localmente:');
        missingValues.forEach(varName => {
          console.log(`- ${varName}`);
        });
        process.exit(1);
      }

      // Agregar variables faltantes
      console.log('\n➕ Agregando variables faltantes...');
      for (const varName of missingVars) {
        const value = process.env[varName];
        execSync(`vercel env add ${varName} production <<< "${value}"`);
        console.log(`✅ ${varName} agregada`);
      }

      // Redeploy
      console.log('\n🚀 Iniciando redeploy...');
      execSync('vercel --prod --confirm');
    } else {
      console.log('\n✅ Todas las variables requeridas están configuradas');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error); 