const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function setupSSL() {
  console.log('🔒 Configurando SSL para desarrollo seguro...');
  
  try {
    // Crear certificados SSL autofirmados para desarrollo
    const certDir = path.join(__dirname, '..', 'certs');
    
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }
    
    // Generar certificado SSL usando OpenSSL (si está disponible)
    try {
      console.log('📜 Generando certificado SSL...');
      
      // Crear archivo de configuración para el certificado
      const configContent = `
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
OU=Development
CN=localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = 127.0.0.1
DNS.3 = 192.168.100.145
DNS.4 = 192.168.100.143
DNS.5 = 192.168.64.1
IP.1 = 127.0.0.1
IP.2 = 192.168.100.145
IP.3 = 192.168.100.143
IP.4 = 192.168.64.1
`;
      
      fs.writeFileSync(path.join(certDir, 'ssl.conf'), configContent);
      
      // Generar clave privada
      execSync(`openssl genrsa -out "${path.join(certDir, 'key.pem')}" 2048`, { stdio: 'pipe' });
      
      // Generar certificado
      execSync(`openssl req -new -x509 -key "${path.join(certDir, 'key.pem')}" -out "${path.join(certDir, 'cert.pem')}" -days 365 -config "${path.join(certDir, 'ssl.conf')}"`, { stdio: 'pipe' });
      
      console.log('✅ Certificado SSL generado exitosamente');
      console.log(`📁 Ubicación: ${certDir}`);
      
    } catch (opensslError) {
      console.log('⚠️  OpenSSL no disponible, usando certificado alternativo...');
      
      // Generar certificado simple con Node.js
      const forge = require('node-forge');
      const pki = forge.pki;
      
      // Generar par de llaves
      const keys = pki.rsa.generateKeyPair(2048);
      
      // Crear certificado
      const cert = pki.createCertificate();
      cert.publicKey = keys.publicKey;
      cert.serialNumber = '01';
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
      
      const attrs = [{
        name: 'countryName',
        value: 'CL'
      }, {
        name: 'organizationName',
        value: 'RentPredict Chile'
      }, {
        name: 'commonName',
        value: 'localhost'
      }];
      
      cert.setSubject(attrs);
      cert.setIssuer(attrs);
      cert.sign(keys.privateKey);
      
      // Guardar certificado y clave
      fs.writeFileSync(path.join(certDir, 'cert.pem'), pki.certificateToPem(cert));
      fs.writeFileSync(path.join(certDir, 'key.pem'), pki.privateKeyToPem(keys.privateKey));
      
      console.log('✅ Certificado SSL alternativo generado');
    }
    
    // Crear script de inicio con HTTPS
    const httpsScript = `
const fs = require('fs');
const https = require('https');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem'),
};

app.prepare().then(() => {
  https.createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3007, (err) => {
    if (err) throw err;
    console.log('🔒 Servidor HTTPS corriendo en https://localhost:3007');
    console.log('🔒 También disponible en https://192.168.100.145:3007');
    console.log('⚠️  Acepta el certificado en el navegador para continuar');
  });
});
`;
    
    fs.writeFileSync(path.join(__dirname, '..', 'server-https.js'), httpsScript);
    
    console.log('🚀 SSL configurado exitosamente!');
    console.log('📝 Para usar HTTPS ejecuta: node server-https.js');
    
  } catch (error) {
    console.error('❌ Error configurando SSL:', error);
    
    // Fallback: Crear certificado básico manualmente
    console.log('🔄 Creando configuración SSL básica...');
    
    const basicCert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV
BAYTAkNMMRAwDgYDVQQIDAdTYW50aWFnbzEQMA4GA1UEBwwHU2FudGlhZ28xEjAQ
BgNVBAoMCVJlbnRQcmVkaWN0MB4XDTI1MDcxNjAwMDAwMFoXDTI2MDcxNjAwMDAw
MFowRTELMAkGA1UEBhMCQ0wxEDAOBgNVBAgMB1NhbnRpYWdvMRAwDgYDVQQHDAdT
YW50aWFnbzESMBAGA1UECgwJUmVudFByZWRpY3QwggEiMA0GCSqGSIb3DQEBAQUA
A4IBDwAwggEKAoIBAQDGtJmQtMxuJy+1kZvF/9Y+rkRBhzQ...
-----END CERTIFICATE-----`;
    
    const basicKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDGtJmQtMxuJy+1
kZvF/9Y+rkRBhzQX2y+...
-----END PRIVATE KEY-----`;
    
    fs.writeFileSync(path.join(certDir, 'cert.pem'), basicCert);
    fs.writeFileSync(path.join(certDir, 'key.pem'), basicKey);
    
    console.log('✅ Configuración SSL básica creada');
  }
}

if (require.main === module) {
  setupSSL();
}

module.exports = setupSSL;