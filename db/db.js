// db.js
/*
const mongoose = require('mongoose');
const config = require('../config/config'); // Importar la configuración

const dbURI = config.database.uri;

mongoose.connect(dbURI)
  .then(() => {
    console.log('Conectado a MongoDB');
  })
  .catch((err) => {
    console.error('Error en la conexión a MongoDB:', err);
  });

module.exports = mongoose.connection;
*/

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
