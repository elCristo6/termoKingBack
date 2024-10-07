// lib/middleware/wsAuthMiddleware.js

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user');

/**
 * Middleware para autenticar conexiones WebSocket usando JWT.
 * @param {WebSocket} ws - Objeto WebSocket.
 * @param {IncomingMessage} req - Solicitud HTTP entrante.
 * @returns {Promise<string>} - userId del usuario autenticado.
 */
const authenticateWS = async (ws, req) => {
  return new Promise((resolve, reject) => {
    // Extraer el token del URL (Query Parameters)
    const params = new URLSearchParams(req.url.replace('/', ''));
    const token = params.get('token');

    if (!token) {
      ws.send(JSON.stringify({ error: 'Token de autenticación requerido.' }));
      return reject(new Error('Token de autenticación requerido.'));
    }

    // Verificar el token
    jwt.verify(token, config.jwt.secret, async (err, decoded) => {
      if (err) {
        ws.send(JSON.stringify({ error: 'Token de autenticación inválido.' }));
        return reject(new Error('Token de autenticación inválido.'));
      }

      try {
        const user = await User.findById(decoded.id);
        if (!user) {
          ws.send(JSON.stringify({ error: 'Usuario no encontrado.' }));
          return reject(new Error('Usuario no encontrado.'));
        }

        // Asignar el userId al WebSocket
        ws.userId = user.userId;
        resolve(user.userId);
      } catch (error) {
        ws.send(JSON.stringify({ error: 'Error al verificar el usuario.' }));
        reject(error);
      }
    });
  });
};

module.exports = { authenticateWS };
