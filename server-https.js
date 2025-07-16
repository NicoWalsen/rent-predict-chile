
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
  }).listen(3007, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log('🔒 Servidor HTTPS corriendo en:');
    console.log('🖥️  Desktop: https://localhost:3007');
    console.log('📱 Móvil: https://192.168.100.145:3007');
    console.log('⚠️  Acepta el certificado en el navegador para continuar');
    console.log('📋 Para móvil: conectar a la misma WiFi y abrir la URL móvil');
  });
});
