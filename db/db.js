
// lib/db/db.js


const mongoose = require('mongoose');
const config = require('../config/config'); // Asegúrate de que la ruta es correcta

const connectDB = async () => {
  try {
    await mongoose.connect(config.database.uri);
    console.log('Conectado a MongoDB exitosamente.');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1); // Salir del proceso si la conexión falla
  }
};

module.exports = connectDB;
