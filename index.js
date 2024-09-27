// index.js

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const awsIot = require('aws-iot-device-sdk');
const path = require('path');

// Importar la configuración
const config = require('./config');

// Importar las rutas
const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

// Importar el controlador
const deviceController = require('./controllers/deviceController');

// Conectar a la base de datos
require('./db');  // La conexión ya se maneja en db.js

// Crear la aplicación Express
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = config.server.port || 3000; // Utiliza el puerto desde la configuración

// Configurar body-parser para parsear JSON
app.use(bodyParser.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de AWS IoT Core
const device = awsIot.device({
  keyPath: config.awsIoT.keyPath,
  certPath: config.awsIoT.certPath,
  caPath: config.awsIoT.caPath,
  clientId: config.awsIoT.clientId,
  host: config.awsIoT.host,
});

// Inicializar el controlador con WebSocket y dispositivo AWS IoT
deviceController.initialize(wss, device);

// Manejo de conexión con AWS IoT Core
device.on('connect', function () {
  console.log('Conectado a AWS IoT');
  device.subscribe(config.mqttTopics.dataReceived, function (err) {
    if (err) {
      console.error('Error al suscribirse:', err);
    } else {
      console.log(`Suscrito al tópico ${config.mqttTopics.dataReceived}`);
    }
  });
  device.subscribe(config.mqttTopics.setPoint, function (err) {
    if (err) {
      console.error('Error al suscribirse:', err);
    } else {
      console.log(`Suscrito al tópico ${config.mqttTopics.setPoint}`);
    }
  });
});

// Manejo de mensajes de AWS IoT
device.on('message', function (topic, payload) {
  console.log(`Mensaje recibido en tópico ${topic}`);
  deviceController.processMessage(payload);
});

// Manejo de errores de AWS IoT
device.on('error', function (error) {
  console.error('Error en AWS IoT:', error);
});

// Usar las rutas de usuarios y dispositivos
app.use('/api', userRoutes);
app.use('/api', deviceRoutes);

// Manejo de conexiones WebSocket
wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  console.log(`Clientes conectados: ${wss.clients.size}`);

  // Enviar un mensaje de bienvenida al cliente
  const welcomeMessage = { message: 'Conexión exitosa con el servidor WebSocket' };
  ws.send(JSON.stringify(welcomeMessage));

  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
    console.log(`Clientes conectados: ${wss.clients.size}`);
  });
});

// Inicia el servidor
server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
