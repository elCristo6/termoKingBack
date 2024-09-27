// controllers/userController.js

const User = require('../models/user');

class UserController {
  
  // Crear un nuevo usuario
  async createUser(req, res) {
    try {
      const { userId, name, userType, password, deviceId } = req.body;

      // Verificar que todos los campos estén presentes
      if (!userId || !name || !userType || !password || !deviceId) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      // Crear el nuevo usuario
      const newUser = new User({ userId, name, userType, password, deviceId });

      // Guardar en la base de datos
      await newUser.save();

      res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      res.status(500).json({ error: 'Error al crear el usuario' });
    }
  }

  // Obtener un usuario por userId
  async getUserByUserId(req, res) {
    try {
      const { userId } = req.params;

      // Buscar el usuario en la base de datos
      const user = await User.findOne({ userId });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      res.status(500).json({ error: 'Error al obtener el usuario' });
    }
  }

  // Obtener todos los usuarios
  async getAllUsers(req, res) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
  }

  // Actualizar un usuario por userId
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updatedData = req.body;

      // Actualizar el usuario en la base de datos
      const updatedUser = await User.findOneAndUpdate({ userId }, updatedData, { new: true });

      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
  }

  // Eliminar un usuario por userId
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      // Eliminar el usuario de la base de datos
      const deletedUser = await User.findOneAndDelete({ userId });

      if (!deletedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
  }
}

module.exports = new UserController();
