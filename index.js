
// lib/index.js

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const awsIot = require('aws-iot-device-sdk');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config(); // Cargar variables de entorno al inicio

// Importar la configuración
const config = require('./config/config');

// Importar las rutas
const userRoutes = require('./routes/userRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

// Importar el controlador
const deviceController = require('./controllers/deviceController');

// Importar y conectar la base de datos
const connectDB = require('./db/db');
connectDB(); // Llamar a la función para conectar a MongoDB

// Crear la aplicación Express
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 3002; // Utiliza el puerto desde la configuración

// Configurar body-parser para parsear JSON
app.use(bodyParser.json());

// Configurar CORS si es necesario
app.use(cors());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Verificar que los archivos de certificados existen
try {
    fs.accessSync(config.awsIoT.keyPath, fs.constants.R_OK);
    fs.accessSync(config.awsIoT.certPath, fs.constants.R_OK);
    fs.accessSync(config.awsIoT.caPath, fs.constants.R_OK);
    console.log('Todos los archivos de certificados están accesibles.');
} catch (err) {
    console.error('Error: No se puede acceder a uno o más archivos de certificados.');
    process.exit(1);
}

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

// Inicia el servidor
server.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

