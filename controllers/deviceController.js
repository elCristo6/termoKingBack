// controllers/deviceController.js

const DeviceData = require('../models/deviceData');
const WebSocket = require('ws');
const config = require('../config'); // Importar la configuración

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
  }

  processMessage(message) {
    try {
      const data = JSON.parse(message.toString());
      const deviceData = new DeviceData(data);

      console.log('Datos del Dispositivo Recibidos:', deviceData);
      console.log(`Enviando datos a ${this.wss.clients.size} clientes`);

      // Emite los datos a todos los clientes conectados
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(deviceData));
        }
      });
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
