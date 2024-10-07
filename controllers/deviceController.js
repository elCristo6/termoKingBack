/*
// lib/controllers/deviceController.js

const DeviceData = require('../models/deviceData');
const WebSocket = require('ws');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { authenticateWS } = require('../middleware/wsAuthMiddleware');

// Mapa para asociar userId con WebSocket
const userSockets = new Map();

class DeviceController {
  constructor() {
    this.wss = null;
    this.device = null;
    // Enlazar métodos al contexto de la instancia
    this.processMessage = this.processMessage.bind(this);
    this.setSetPoint = this.setSetPoint.bind(this);
  }

  initialize(wss, device) {
    this.wss = wss;
    this.device = device;

    // Manejar nuevas conexiones WebSocket
    this.wss.on('connection', async (ws, req) => {
      try {
        // Autenticar la conexión WebSocket
        const userId = await authenticateWS(ws, req);

        // Asociar el userId con la conexión WebSocket
        if (userSockets.has(userId)) {
          // Opcional: Manejar múltiples conexiones por usuario si es necesario
          console.log(`El usuario ${userId} ya tiene una conexión activa.`);
          // Puedes decidir cerrar la nueva conexión o permitir múltiples conexiones
          // Por ahora, permitiremos múltiples conexiones
        }

        userSockets.set(userId, ws);
        console.log(`Cliente autenticado: ${userId}`);

        // Enviar mensaje de bienvenida al cliente
        ws.send(JSON.stringify({ message: 'Conexión WebSocket exitosa.' }));

        // Manejar mensajes entrantes del cliente (si es necesario)
        ws.on('message', (message) => {
          console.log(`Mensaje recibido de ${ws.userId}: ${message}`);
          // Implementar lógica si se espera recibir mensajes del cliente
        });

        // Manejar el cierre de la conexión
        ws.on('close', () => {
          if (ws.userId) {
            userSockets.delete(ws.userId);
            console.log(`Conexión WebSocket cerrada para ${ws.userId}`);
          }
        });
      } catch (error) {
        console.error('Error en la autenticación WebSocket:', error);
        ws.close();
      }
    });
  }

  processMessage(message) {
    try {
      const data = JSON.parse(message.toString());
      const deviceData = new DeviceData(data);

      console.log('Datos del Dispositivo Recibidos:', deviceData);

      // Verificar que el data tenga un userId
      const targetUserId = deviceData.userId;

      if (!targetUserId) {
        console.error('No se proporcionó userId en los datos del dispositivo.');
        return;
      }

      // Obtener la conexión WebSocket correspondiente al userId
      const client = userSockets.get(targetUserId);

      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(deviceData));
        console.log(`Datos enviados al usuario: ${targetUserId}`);
      } else {
        console.warn(`No hay conexión WebSocket abierta para el usuario: ${targetUserId}`);
      }
    } catch (error) {
      console.error('Error al procesar el mensaje:', error);
    }
  }

  // Método para establecer el setPoint
  setSetPoint(req, res) {
    const { setPoint } = req.body;

    if (!setPoint) {
      return res.status(400).json({ error: 'El campo setPoint es requerido' });
    }

    const payload = { setPoint };

    // Publicar al tópico configurado
    this.device.publish(
      config.mqttTopics.setPoint,
      JSON.stringify(payload),
      (err) => {
        if (err) {
          console.error('Error al publicar el setPoint:', err);
          return res.status(500).json({ error: 'Error al publicar el setPoint' });
        }

        console.log(`setPoint publicado: ${JSON.stringify(payload)}`);
        res.json({ message: 'setPoint enviado correctamente', payload });
      }
    );
  }
}

module.exports = new DeviceController(); // Exportamos una instancia del controlador
*/
// lib/controllers/deviceController.js

const DeviceData = require('../models/deviceData');
const WebSocket = require('ws');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Asegúrate de importar el modelo de usuario
const { authenticateWS } = require('../middleware/wsAuthMiddleware');

// Mapa para asociar userId con WebSocket
const userSockets = new Map();

class DeviceController {
    constructor() {
        this.wss = null;
        this.device = null;
        // Enlazar métodos al contexto de la instancia
        this.processMessage = this.processMessage.bind(this);
        this.setSetPoint = this.setSetPoint.bind(this);
    }

    initialize(wss, device) {
        this.wss = wss;
        this.device = device;

        // Manejar nuevas conexiones WebSocket
        this.wss.on('connection', async (ws, req) => {
            try {
                // Autenticar la conexión WebSocket
                const userId = await authenticateWS(ws, req);

                // Asociar el userId con la conexión WebSocket
                if (userSockets.has(userId)) {
                    // Opcional: Manejar múltiples conexiones por usuario si es necesario
                    console.log(`El usuario ${userId} ya tiene una conexión activa.`);
                    // Puedes decidir cerrar la nueva conexión o permitir múltiples conexiones
                    // Por ahora, permitiremos múltiples conexiones
                }

                userSockets.set(userId, ws);
                console.log(`Cliente autenticado: ${userId}`);

                // Enviar mensaje de bienvenida al cliente
                ws.send(JSON.stringify({ message: 'Conexión WebSocket exitosa.' }));

                // Manejar mensajes entrantes del cliente (si es necesario)
                ws.on('message', (message) => {
                    console.log(`Mensaje recibido de ${ws.userId}: ${message}`);
                    // Implementar lógica si se espera recibir mensajes del cliente
                });

                // Manejar el cierre de la conexión
                ws.on('close', () => {
                    if (ws.userId) {
                        userSockets.delete(ws.userId);
                        console.log(`Conexión WebSocket cerrada para ${ws.userId}`);
                    }
                });
            } catch (error) {
                console.error('Error en la autenticación WebSocket:', error);
                ws.close();
            }
        });
    }

    async processMessage(message) {
        try {
            const data = JSON.parse(message.toString());
            const deviceData = new DeviceData(data);

            console.log('Datos del Dispositivo Recibidos:', deviceData);

            // Verificar que el data tenga un deviceID
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

            // Añadir userId a los datos
            const dataWithUserId = {
                ...data,
                userId: userId
            };

            // Obtener la conexión WebSocket correspondiente al userId
            const client = userSockets.get(userId);

            if (client && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(dataWithUserId));
                console.log(`Datos enviados al usuario: ${userId}`);
            } else {
                console.warn(`No hay conexión WebSocket abierta para el usuario: ${userId}`);
            }
        } catch (error) {
            console.error('Error al procesar el mensaje:', error);
        }
    }

    // Método para establecer el setPoint
    setSetPoint(req, res) {
        const { setPoint } = req.body;

        if (!setPoint) {
            return res.status(400).json({ error: 'El campo setPoint es requerido' });
        }

        const payload = { setPoint };

        // Publicar al tópico configurado
        this.device.publish(
            config.mqttTopics.setPoint,
            JSON.stringify(payload),
            (err) => {
                if (err) {
                    console.error('Error al publicar el setPoint:', err);
                    return res.status(500).json({ error: 'Error al publicar el setPoint' });
                }

                console.log(`setPoint publicado: ${JSON.stringify(payload)}`);
                res.json({ message: 'setPoint enviado correctamente', payload });
            }
        );
    }
}

module.exports = new DeviceController(); // Exportamos una instancia del controlador
