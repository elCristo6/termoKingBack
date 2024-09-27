// routes/deviceRoutes.js

const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// Ruta para establecer el setPoint
router.post('/setPoint', deviceController.setSetPoint);

module.exports = router;
