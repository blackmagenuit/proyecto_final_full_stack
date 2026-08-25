const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verificar JWT y obtener usuario
exports.verify = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_super_seguro');
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: error.message
    });
  }
};

// Verificar si el usuario es administrador
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'administrador') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo administradores.'
    });
  }
  next();
};

// Verificar si es administrador u operario
exports.isAdminOrOperator = (req, res, next) => {
  if (!['administrador', 'operario'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado'
    });
  }
  next();
};
