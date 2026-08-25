const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { verify, isAdmin } = require('../middleware/auth');

// Generar JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'tu_secreto_super_seguro',
    { expiresIn: '7d' }
  );
};

// Registro de usuario
router.post('/register', [
  body('name', 'El nombre es requerido').trim().notEmpty(),
  body('email', 'Email inválido').isEmail().normalizeEmail(),
  body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Verificar si el email ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const nuevoUsuario = new User({
      name,
      email,
      password,
      role: 'operario'
    });

    await nuevoUsuario.save();

    const token = generateToken(nuevoUsuario._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: nuevoUsuario.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el registro',
      error: error.message
    });
  }
});

// Login
router.post('/login', [
  body('email', 'Email inválido').isEmail(),
  body('password', 'Contraseña requerida').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario y verificar contraseña
    const usuario = await User.findOne({ email }).select('+password');
    if (!usuario || !(await usuario.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    if (!usuario.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    const token = generateToken(usuario._id);

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: usuario.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en el login',
      error: error.message
    });
  }
});

// Obtener perfil del usuario autenticado
router.get('/me', verify, (req, res) => {
  res.json({
    success: true,
    user: req.user.toJSON()
  });
});

// Actualizar perfil
router.put('/profile', verify, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (email && email !== req.user.email) {
      const emailExistente = await User.findOne({ email });
      if (emailExistente) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso'
        });
      }
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, updatedAt: new Date() },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Perfil actualizado',
      user: usuarioActualizado.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
});

module.exports = router;
