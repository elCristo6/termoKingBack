/*
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  userType: { type: String, required: true },
  password: { type: String, required: true },
  deviceId: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
*/


// lib/models/user.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Definir el esquema del usuario
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Identificador único del usuario
  name: { type: String, required: true },
  userType: { type: String, required: true }, // Por ejemplo, 'admin', 'user', etc.
  password: { type: String, required: true },
  deviceId: { type: String, required: true }, // Asociar dispositivo con usuario
}, { timestamps: true });

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre('save', async function (next) {
  try {
    // Si la contraseña no ha sido modificada, continuar
    if (!this.isModified('password')) {
      return next();
    }
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;
