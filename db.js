// db.js

const mongoose = require('mongoose');
const config = require('./config'); // Importar la configuración

const dbURI = config.database.uri;

mongoose.connect(dbURI)
  .then(() => {
    console.log('Conectado a MongoDB');
  })
  .catch((err) => {
    console.error('Error en la conexión a MongoDB:', err);
  });

module.exports = mongoose.connection;
