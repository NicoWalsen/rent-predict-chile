const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function createTrustedCertificate() {
  console.log('🔒 Creando certificado SSL confiable para desarrollo...');
  
  const certDir = path.join(__dirname, '..', 'certs');
  
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  try {
    // 1. Crear Autoridad Certificadora (CA) root
    console.log('📜 Creando Autoridad Certificadora root...');
    
    const caConfigContent = `
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_ca

[dn]
C=CL
ST=Santiago
L=Santiago
O=RentPredict Chile CA
OU=Development Certificate Authority
CN=RentPredict Root CA

[v3_ca]
basicConstraints = critical,CA:TRUE
keyUsage = critical, digitalSignature, cRLSign, keyCertSign
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer:always
`;

    fs.writeFileSync(path.join(certDir, 'ca.conf'), caConfigContent);

    // Generar clave privada de CA
    execSync(`openssl genrsa -out "${path.join(certDir, 'ca-key.pem')}" 2048`, { stdio: 'pipe' });
    
    // Generar certificado de CA
    execSync(`openssl req -new -x509 -days 3650 -key "${path.join(certDir, 'ca-key.pem')}" -out "${path.join(certDir, 'ca-cert.pem')}" -config "${path.join(certDir, 'ca.conf')}"`, { stdio: 'pipe' });

    // 2. Crear certificado del servidor firmado por CA
    console.log('🏷️ Creando certificado del servidor...');
    
    const serverConfigContent = `
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=CL
ST=Santiago
L=Santiago
O=RentPredict Chile
OU=Development Server
CN=localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = 127.0.0.1
DNS.4 = 192.168.100.145
DNS.5 = 192.168.100.143
DNS.6 = 192.168.64.1
IP.1 = 127.0.0.1
IP.2 = 192.168.100.145
IP.3 = 192.168.100.143
IP.4 = 192.168.64.1
`;

    fs.writeFileSync(path.join(certDir, 'server.conf'), serverConfigContent);

    // Generar clave privada del servidor
    execSync(`openssl genrsa -out "${path.join(certDir, 'key.pem')}" 2048`, { stdio: 'pipe' });
    
    // Generar solicitud de certificado (CSR)
    execSync(`openssl req -new -key "${path.join(certDir, 'key.pem')}" -out "${path.join(certDir, 'server.csr')}" -config "${path.join(certDir, 'server.conf')}"`, { stdio: 'pipe' });
    
    // Firmar certificado con CA
    execSync(`openssl x509 -req -in "${path.join(certDir, 'server.csr')}" -CA "${path.join(certDir, 'ca-cert.pem')}" -CAkey "${path.join(certDir, 'ca-key.pem')}" -CAcreateserial -out "${path.join(certDir, 'cert.pem')}" -days 365 -extensions v3_req -extfile "${path.join(certDir, 'server.conf')}"`, { stdio: 'pipe' });

    console.log('✅ Certificado SSL confiable creado exitosamente');
    console.log(`📁 Ubicación: ${certDir}`);
    
    // 3. Crear script para instalar CA en Windows
    const installScript = `
@echo off
echo 🔒 Instalando Autoridad Certificadora en Windows...
echo.
echo IMPORTANTE: Esto instalará el certificado CA en el almacén de certificados
echo de "Autoridades de certificación raíz de confianza" de Windows.
echo.
pause

certlm.msc -addstore "Root" "${path.join(certDir, 'ca-cert.pem').replace(/\//g, '\\')}"

if %ERRORLEVEL% EQU 0 (
    echo ✅ CA instalada exitosamente
    echo ℹ️  Ahora https://localhost:3008 será confiable
) else (
    echo ❌ Error instalando CA. Ejecutar como administrador.
)

pause
`;

    fs.writeFileSync(path.join(certDir, 'install-ca.bat'), installScript);

    console.log('');
    console.log('🎯 SIGUIENTE PASO:');
    console.log('1. Ejecuta como ADMINISTRADOR: certs/install-ca.bat');
    console.log('2. Esto instalará la CA en Windows para que confíe en el certificado');
    console.log('3. Reinicia el navegador después de la instalación');
    console.log('4. Ejecuta: npm run dev:https');
    console.log('5. Ve a https://localhost:3008 - ya no mostrará "No es seguro"');
    
  } catch (error) {
    console.error('❌ Error creando certificado confiable:', error.message);
    console.log('');
    console.log('🔄 Alternativa: Acepta manualmente el certificado');
    console.log('1. Ve a https://localhost:3008');
    console.log('2. Haz clic en "Avanzado" > "Continuar a localhost"');
    console.log('3. El navegador recordará tu elección');
  }
}

if (require.main === module) {
  createTrustedCertificate();
}

module.exports = createTrustedCertificate;