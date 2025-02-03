
// lib/controllers/deviceController.js

const DeviceData = require('../models/deviceData');
const WebSocket = require('ws');
const config = require('../config/config');
const User = require('../models/user');
const { authenticateWS } = require('../middleware/wsAuthMiddleware');

const userSockets = new Map();
const deviceStatus = new Map(); // Almacenar el estado de cada dispositivo y la última vez que envió datos

class DeviceController {
    constructor() {
        this.wss = null;
        this.device = null;

        this.processMessage = this.processMessage.bind(this);
        this.setSetPoint = this.setSetPoint.bind(this);
        this.handleMQTTMessage = this.handleMQTTMessage.bind(this);
        this.subscribeToDeviceTopics = this.subscribeToDeviceTopics.bind(this);
        this.checkDeviceInactivity = this.checkDeviceInactivity.bind(this);
        this.getActiveDevices = this.getActiveDevices.bind(this);
    }

    // Nuevo método para devolver dispositivos activos
   
   

getActiveDevices(req, res) {
    const activeDevices = [];

    deviceStatus.forEach((statusInfo, connectionKey) => {
        // Verificar que connectionKey exista y esté en el formato esperado "userId-deviceId"
        if (connectionKey && typeof connectionKey === 'string' && connectionKey.includes('-')) {
            const parts = connectionKey.split('-');
            if (parts.length === 2 && statusInfo.status === 'active') {
                const [userId, deviceId] = parts;
                activeDevices.push({ userId, deviceId });
            }
        }
    });

    res.json({ activeDevices });
}


    initialize(wss, device) {
        this.wss = wss;
        this.device = device;
    
        // Manejar nuevas conexiones WebSocket
        this.wss.on('connection', async (ws, req) => {
            try {
                const user = await authenticateWS(ws, req);
                const { userId, userType } = user;    
                const urlParams = new URLSearchParams(req.url.replace('/', ''));
                const deviceId = urlParams.get('deviceID');

                if (!deviceId) {
                    ws.send(JSON.stringify({ error: 'DeviceID es requerido.' }));
                    ws.close();
                    return;
                }

                const connectionKey = `${userId}-${deviceId}`;
                
                // Guardar la conexión WebSocket y marcar como "activo"
                userSockets.set(connectionKey, ws);
                deviceStatus.set(connectionKey, { status: 'active', lastMessage: Date.now() });

                console.log(`Cliente conectado: ${userId} con deviceId: ${deviceId}`);

                // Suscribirse a los tópicos de MQTT para este deviceID
                this.subscribeToDeviceTopics(deviceId);

                // Enviar mensaje de bienvenida y estado actual
                ws.send(JSON.stringify({
                    message: 'Conexión WebSocket exitosa.',
                    userId: userId,
                    userType: userType, 
                    deviceId: deviceId,
                    status: 'active'
                }));

                // Temporizador para verificar la inactividad del dispositivo
                this.checkDeviceInactivity(connectionKey, ws);

                // Manejar mensajes entrantes
                ws.on('message', (message) => {
                    console.log(`Mensaje recibido de ${connectionKey}: ${message}`);
                });

                // Manejar el cierre de la conexión
                ws.on('close', () => {
                    userSockets.delete(connectionKey);
                    deviceStatus.set(connectionKey, { status: 'inactive', lastMessage: Date.now() });
                    console.log(`Conexión WebSocket cerrada para ${connectionKey}`);
                });
            } catch (error) {
                console.error('Error en la autenticación WebSocket:', error);
                ws.close();
            }
        });

        // Manejo de mensajes de MQTT (vinculado al dispositivo)
        this.device.on('message', (topic, payload) => {
            this.handleMQTTMessage(topic, payload);
        });
    }

    // Método para suscribirse a los tópicos específicos de un dispositivo
    subscribeToDeviceTopics(deviceID) {
        const dataTopic = config.mqttTopics.dataReceived(deviceID);
        const setPointTopic = config.mqttTopics.setPoint(deviceID);

        // Suscribirse a los tópicos específicos del deviceID
        this.device.subscribe(dataTopic, (err) => {
            if (err) {
                console.error(`Error al suscribirse al tópico ${dataTopic}:`, err);
            } else {
                console.log(`Suscrito al tópico ${dataTopic}`);
            }
        });

        this.device.subscribe(setPointTopic, (err) => {
            if (err) {
                console.error(`Error al suscribirse al tópico ${setPointTopic}:`, err);
            } else {
                console.log(`Suscrito al tópico ${setPointTopic}`);
            }
        });
    }

async handleMQTTMessage(topic, payload) {
    try {
        const data = JSON.parse(payload.toString());
        const deviceData = new DeviceData(data);
        const deviceId = deviceData.deviceID;

        if (!deviceId) {
            console.error('No se proporcionó deviceID en los datos del dispositivo.');
            return;
        }

        // Buscar el usuario asociado al deviceID
        const user = await User.findOne({ deviceId: deviceId });
        if (!user) {
            console.error(`No se encontró usuario para deviceID: ${deviceId}`);
            return;
        }

        const userId = user.userId;
        const connectionKey = `${userId}-${deviceId}`;

        // Actualizar el estado del dispositivo como activo y el tiempo del último mensaje
        deviceStatus.set(connectionKey, { status: 'active', lastMessage: Date.now() });

        // Enviar datos al cliente WebSocket si está activo
        const client = userSockets.get(connectionKey);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                ...data,
                userId: userId,
                status: 'active'
            }));
            console.log(`Datos enviados al cliente WebSocket para usuario ${userId}`);
        }

        // Solo imprimir en consola si el dispositivo está activo
        console.log(`Dispositivo Activo: ${deviceId} (Usuario: ${userId})`);
        console.log("Datos MQTT recibidos:", data);
        
    } catch (error) {
        console.error('Error al procesar el mensaje MQTT:', error);
    }
}

checkDeviceInactivity(connectionKey, ws) {
    setInterval(() => {
        const statusInfo = deviceStatus.get(connectionKey);
        if (statusInfo && Date.now() - statusInfo.lastMessage > 10000) { // 10 segundos sin mensajes MQTT
            if (statusInfo.status === 'active') {
                // Cambiar a inactivo solo si estaba activo antes
                statusInfo.status = 'inactive';
                console.log(`El dispositivo ${connectionKey} está inactivo.`);
                
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        deviceId: connectionKey.split('-')[1],
                        status: 'inactive'
                    }));
                }
            }
        }
    }, 3000); // Verificar cada 5 segundos
}


    // Método para procesar mensajes WebSocket (sin cambiar mucho de tu lógica actual)
    async processMessage(message, connectionKey) {
        try {
            const data = JSON.parse(message.toString());
            const deviceData = new DeviceData(data);
            const deviceId = deviceData.deviceID;

            if (!deviceId) {
                console.error('No se proporcionó deviceID en los datos del dispositivo.');
                return;
            }

            // Actualizar la última vez que se recibió un mensaje de este dispositivo
            deviceStatus.set(connectionKey, { status: 'active', lastMessage: Date.now() });

            // Buscar el usuario asociado al deviceID
            const user = await User.findOne({ deviceId: deviceId });
            if (!user) {
                console.error(`No se encontró usuario para deviceID: ${deviceId}`);
                return;
            }

            const userId = user.userId;
            const dataWithUserId = { ...data, userId: userId, status: 'active' };

            // Enviar los datos al cliente WebSocket
            const client = userSockets.get(connectionKey);
            if (client && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(dataWithUserId));
                console.log(`Datos enviados al usuario: ${userId}`);
            }
        } catch (error) {
            console.error('Error al procesar el mensaje:', error);
        }
    }

    // Método para establecer el setPoint
    setSetPoint(req, res) {
        const { setPoint, deviceID } = req.body;
        if (!setPoint || !deviceID) {
            return res.status(400).json({ error: 'El campo setPoint y deviceID son requeridos' });
        }

        const payload = { setPoint };
        const setPointTopic = config.mqttTopics.setPoint(deviceID);

        this.device.publish(setPointTopic, JSON.stringify(payload), (err) => {
            if (err) {
                console.error('Error al publicar el setPoint:', err);
                return res.status(500).json({ error: 'Error al publicar el setPoint' });
            }
            console.log(`setPoint publicado en ${setPointTopic}: ${JSON.stringify(payload)}`);
            res.json({ message: 'setPoint enviado correctamente', payload });
        });
    }
}

module.exports = new DeviceController();
