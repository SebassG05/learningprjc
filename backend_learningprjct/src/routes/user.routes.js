import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, logoutUser } from '../controller/userController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
  ],
  registerUser
);

// Iniciar sesión
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  loginUser
);

// Cerrar sesión
router.post('/logout', authenticateJWT, logoutUser);

export default router;
