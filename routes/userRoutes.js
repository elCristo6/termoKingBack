// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta para crear un nuevo usuario
router.post('/users', userController.createUser);

// Ruta para obtener un usuario por userId
router.get('/users/:userId', userController.getUserByUserId);

// Ruta para obtener todos los usuarios
router.get('/users', userController.getAllUsers);

// Ruta para actualizar un usuario por userId
router.put('/users/:userId', userController.updateUser);

// Ruta para eliminar un usuario por userId
router.delete('/users/:userId', userController.deleteUser);

module.exports = router;
