// config.js

const path = require('path');

module.exports = {
  server: {
    port: process.env.PORT || 3000,
  },
  awsIoT: {
    keyPath: path.join(__dirname, 'certs', 'AWSClientPrivateKey.pem.key'),
    certPath: path.join(__dirname, 'certs', 'AWSClientCertificate.pem.crt'),
    caPath: path.join(__dirname, 'certs', 'AmazonRootCA1.pem'),
    clientId: process.env.AWS_IOT_CLIENT_ID || 'MiClienteNodeJS',
    host: process.env.AWS_IOT_HOST || 'a37nxxtzy5io6c-ats.iot.us-east-1.amazonaws.com',
  },
  mqttTopics: {
    dataReceived: 'TermoKingV1.1/datosEntregados',
    setPoint: 'TermoKingV1.1/cargarSetPoint',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://termoKing:91120152349.@termokingdatabase.flnzx.mongodb.net/', 
  },
};
