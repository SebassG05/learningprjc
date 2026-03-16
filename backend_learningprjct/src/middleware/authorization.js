import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware para verificar que el usuario esté autenticado
 */
export const autenticar = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No autorizado',
        mensaje: 'Token de autenticación no proporcionado' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Buscar usuario y verificar que esté activo
    const usuario = await User.findById(decoded.id).select('-password');
    
    if (!usuario) {
      return res.status(401).json({ 
        error: 'No autorizado',
        mensaje: 'Usuario no encontrado' 
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        mensaje: 'Usuario desactivado' 
      });
    }

    // Actualizar último login
    usuario.lastLogin = new Date();
    await usuario.save();

    req.user = usuario;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        mensaje: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Token inválido',
      mensaje: 'Token de autenticación inválido' 
    });
  }
};

/**
 * Middleware para verificar que el usuario sea Admin o SuperAdmin
 */
export const soloAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autenticado',
      mensaje: 'Debes estar autenticado para acceder a este recurso' 
    });
  }

  if (!req.user.esAdmin()) {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      mensaje: 'Solo los administradores pueden acceder a este recurso',
      rolRequerido: 'admin o superadmin',
      tuRol: req.user.role
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario sea SuperAdmin
 */
export const soloSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autenticado',
      mensaje: 'Debes estar autenticado para acceder a este recurso' 
    });
  }

  if (!req.user.esSuperAdmin()) {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      mensaje: 'Solo los superadministradores pueden acceder a este recurso',
      rolRequerido: 'superadmin',
      tuRol: req.user.role
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario sea el dueño del recurso o admin
 */
export const propietarioOAdmin = (campoUserId = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado',
        mensaje: 'Debes estar autenticado' 
      });
    }

    const resourceUserId = req.params[campoUserId] || req.body[campoUserId];

    // Si es admin, puede acceder
    if (req.user.esAdmin()) {
      return next();
    }

    // Si es el propietario, puede acceder
    if (req.user._id.toString() === resourceUserId) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Acceso denegado',
      mensaje: 'No tienes permisos para acceder a este recurso' 
    });
  };
};
