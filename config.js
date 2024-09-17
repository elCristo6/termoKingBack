// config.js

const path = require('path');

module.exports = {
  server: {
    port: 3000,
    // Puedes agregar más configuraciones del servidor aquí si es necesario
  },
  awsIoT: {
    keyPath: path.join(__dirname, 'certs', 'AWSClientPrivateKey.pem.key'),
    certPath: path.join(__dirname, 'certs', 'AWSClientCertificate.pem.crt'),
    caPath: path.join(__dirname, 'certs', 'AmazonRootCA1.pem'),
    clientId: 'MiClienteNodeJS',
    host: 'a37nxxtzy5io6c-ats.iot.us-east-1.amazonaws.com', // Reemplaza con tu endpoint real
  },
  mqttTopics: {
    dataReceived: 'TermoKingV1.1/datosEntregados',
    setPoint: 'TermoKingV1.1/cargarSetPoint',
  },
};
