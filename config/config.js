// lib/config/config.js
/*
const path = require('path');

module.exports = {
  server: {
    port: 3002,
  },
  awsIoT: {
    keyPath: path.resolve(__dirname, '../certs/AWSClientPrivateKey.pem.key'),
    certPath: path.resolve(__dirname, '../certs/AWSClientCertificate.pem.crt'),
    caPath: path.resolve(__dirname, '../certs/AmazonRootCA1.pem'),
    clientId: process.env.AWS_IOT_CLIENT_ID || 'MiClienteNodeJS',
    host: process.env.AWS_IOT_HOST || 'a37nxxtzy5io6c-ats.iot.us-east-1.amazonaws.com',
  },
  mqttTopics: {
    dataReceived: 'TermoKingV1.1/datosEntregados',
    setPoint: 'TermoKingV1.1/cargarSetPoint',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'tu_clave_secreta', // Clave secreta para JWT
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://termoKing:91120152349.@termokingdatabase.flnzx.mongodb.net/', 
  },
};

*/
// lib/config/config.js

const path = require('path');

module.exports = {
  server: {
    port: 3002,
  },
  awsIoT: {
    keyPath: path.resolve(__dirname, '../certs/AWSClientPrivateKey.pem.key'),
    certPath: path.resolve(__dirname, '../certs/AWSClientCertificate.pem.crt'),
    caPath: path.resolve(__dirname, '../certs/AmazonRootCA1.pem'),
    clientId: process.env.AWS_IOT_CLIENT_ID || 'MiClienteNodeJS',
    host: process.env.AWS_IOT_HOST || 'a37nxxtzy5io6c-ats.iot.us-east-1.amazonaws.com',
  },
  mqttTopics: {
    dataReceived: (deviceID) => `TermoKingV1.1/${deviceID}/datosEntregados`,
    setPoint: (deviceID) => `TermoKingV1.1/${deviceID}/cargarSetPoint`,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'tu_clave_secreta',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://termoKing:91120152349.@termokingdatabase.flnzx.mongodb.net/', 
  },
};
