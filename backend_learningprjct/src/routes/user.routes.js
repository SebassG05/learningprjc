import express from 'express';
import { body } from 'express-validator';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  requestPasswordReset, 
  resetPassword, 
  googleLogin,
  enrollInCourse,
  getEnrollmentStatus,
  updateCourseProgress,
  completeCourse,
  completeTest,
  getUserEnrollments
} from '../controller/userController.js';
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

// Solicitar restablecimiento de contraseña
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Email inválido')],
  requestPasswordReset
);

router.post(
  '/reset-password',
  [
    body('userId').notEmpty().withMessage('ID de usuario requerido'),
    body('token').notEmpty().withMessage('Token requerido'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
  ],
  resetPassword
);

// Google Auth endpoint
router.post('/auth/google', googleLogin);

// ============= RUTAS DE INSCRIPCIÓN A CURSOS =============

// Inscribirse a un curso
router.post('/enroll/:courseId', authenticateJWT, enrollInCourse);

// Verificar estado de inscripción
router.get('/enrollment/:courseId', authenticateJWT, getEnrollmentStatus);

// Actualizar progreso del curso
router.put('/enrollment/:courseId/progress', authenticateJWT, updateCourseProgress);

// Marcar curso como completado
router.put('/enrollment/:courseId/complete', authenticateJWT, completeCourse);

// Marcar test como completado
router.post('/enrollment/:courseId/test/:temaId/complete', authenticateJWT, completeTest);

// Obtener todos los cursos inscritos del usuario
router.get('/enrollments', authenticateJWT, getUserEnrollments);

export default router;
