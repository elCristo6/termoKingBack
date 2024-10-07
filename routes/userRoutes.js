// lib/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyJWT } = require('../middleware/authMiddleware');

// Ruta para crear un nuevo usuario
router.post('/users', userController.createUser);

// Ruta para iniciar sesión
router.post('/login', userController.login);

// Ruta para obtener un usuario por userId (protegido)
router.get('/users/:userId', verifyJWT, userController.getUserByUserId);

// Ruta para obtener todos los usuarios (protegido)
router.get('/users', verifyJWT, userController.getAllUsers);

// Ruta para actualizar un usuario por userId (protegido)
router.put('/users/:userId', verifyJWT, userController.updateUser);

// Ruta para eliminar un usuario por userId (protegido)
router.delete('/users/:userId', verifyJWT, userController.deleteUser);

module.exports = router;
