// index.js

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const awsIot = require('aws-iot-device-sdk');
const path = require('path');
// Importar las rutas
const deviceRoutes = require('./routes/deviceRoutes');
// Importar el controlador
const deviceController = require('./controllers/deviceController');
// Importar la configuración
const config = require('./config');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 3000;

// Configurar body-parser para parsear JSON
app.use(bodyParser.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de AWS IoT Core

// Configuración de AWS IoT Core utilizando el archivo de configuración
const device = awsIot.device({
  keyPath: config.awsIoT.keyPath,
  certPath: config.awsIoT.certPath,
  caPath: config.awsIoT.caPath,
  clientId: config.awsIoT.clientId,
  host: config.awsIoT.host,
});

// Inicializar el controlador con wss y device
deviceController.initialize(wss, device);

// Manejo de conexión con AWS IoT Core
device.on('connect', function () {
  console.log('Conectado a AWS IoT');
  device.subscribe('TermoKingV1.1/datosEntregados', function (err) {
    if (err) {
      console.error('Error al suscribirse:', err);
    } else {
      console.log('Suscrito al tópico TermoKingV1.1/datosEntregados');
    }
  });
});

device.on('message', function (topic, payload) {
  console.log(`Mensaje recibido en tópico ${topic}`);
  deviceController.processMessage(payload);
});

device.on('error', function (error) {
  console.error('Error:', error);
});

// Usar las rutas
app.use('/api', deviceRoutes);

// Manejo de conexiones WebSocket
wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');

  // Imprimir el número de clientes conectados
  console.log(`Clientes conectados: ${wss.clients.size}`);

  // Envía un mensaje de prueba al cliente al conectarse
  const testData = { message: 'Mensaje de prueba desde el servidor' };
  ws.send(JSON.stringify(testData));

  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');

    // Imprimir el número de clientes conectados
    console.log(`Clientes conectados: ${wss.clients.size}`);
  });
});

// Inicia el servidor
server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
