// lib/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user');

// Middleware para verificar JWT en las rutas REST
const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autorización requerido.' });
  }

  const token = authHeader.split(' ')[1]; // Asumiendo formato "Bearer token"

  if (!token) {
    return res.status(401).json({ error: 'Token de autorización requerido.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }
    req.user = user; // Adjuntar el usuario a la solicitud
    next();
  } catch (error) {
    console.error('Error en la verificación de JWT:', error);
    return res.status(403).json({ error: 'Token inválido.' });
  }
};

module.exports = { verifyJWT };
