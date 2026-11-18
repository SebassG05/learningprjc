import express from 'express';
import { body, validationResult } from 'express-validator';
import { GOOGLE_ID_PASSWORD_MESSAGE, looksLikeGoogleId } from '../utils/passwordPolicy.js';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  requestPasswordReset, 
  resetPassword, 
  googleLogin,
  verificarCorreo,
  reenviarCodigoCorreo,
  enrollInCourse,
  getEnrollmentStatus,
  changePreferredLanguage,
  updateCourseProgress,
  completeCourse,
  completeTest,
  getUserEnrollments,
  getCurrentUser,
  getAdminCourseEnrollments,
  getAdminEnrollments
} from '../controller/userController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { autenticar, soloAdmin } from '../middleware/authorization.js';
import createRateLimit from '../middleware/rateLimit.js';
import { fromParam, requireCourseAccess } from '../middleware/courseAccess.js';

// Progreso, idioma y tests completados: permitidos también en solo lectura
const readCourse = requireCourseAccess('read', fromParam('courseId'));

// Inscribirse guarda la aceptación de los términos (una prueba): pocas por minuto y por IP
const enrollRateLimit = createRateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Demasiadas peticiones. Espera un momento e inténtalo de nuevo.',
});

// Registro: cada uno manda un correo con código. Pocos por IP para que no se use para enviar correos a terceros.
const registerRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Demasiados registros desde esta conexión. Inténtalo más tarde.',
});
// Comprobar el código: además del límite de 5 intentos por código
const verifyRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Demasiados intentos. Espera unos minutos.',
});
const resendRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiadas peticiones de código. Espera unos minutos.',
});

const router = express.Router();

router.post(
  '/register',
  registerRateLimit,
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('password').not().custom(looksLikeGoogleId).withMessage(GOOGLE_ID_PASSWORD_MESSAGE),
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

// Confirmar el correo con el código (abre la sesión) y pedir otro
router.post(
  '/verificar-correo',
  verifyRateLimit,
  [body('email').isEmail().withMessage('Email inválido'), body('codigo').notEmpty().withMessage('Escribe el código')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    return next();
  },
  verificarCorreo
);
router.post(
  '/verificar-correo/reenviar',
  resendRateLimit,
  [body('email').isEmail().withMessage('Email inválido')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    return next();
  },
  reenviarCodigoCorreo
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
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
    body('newPassword').not().custom(looksLikeGoogleId).withMessage(GOOGLE_ID_PASSWORD_MESSAGE)
  ],
  resetPassword
);

// Google Auth endpoint
router.post('/auth/google', googleLogin);

// Obtener datos del usuario actual
router.get('/me', authenticateJWT, getCurrentUser);

// ============= RUTAS DE INSCRIPCIÓN A CURSOS =============

// Inscribirse a un curso
router.post('/enroll/:courseId', enrollRateLimit, authenticateJWT, requireCourseAccess('write', fromParam('courseId')), enrollInCourse);

// Verificar estado de inscripción
router.get('/enrollment/:courseId', authenticateJWT, getEnrollmentStatus);

// Cambiar idioma preferido para un curso
router.put('/enrollment/:courseId/language', authenticateJWT, readCourse, changePreferredLanguage);

// Actualizar progreso del curso
router.put('/enrollment/:courseId/progress', authenticateJWT, readCourse, updateCourseProgress);

// Marcar curso como completado
router.put('/enrollment/:courseId/complete', authenticateJWT, readCourse, completeCourse);

// Marcar test como completado
router.post('/enrollment/:courseId/test/:temaId/complete', authenticateJWT, readCourse, completeTest);

// Obtener todos los cursos inscritos del usuario
router.get('/enrollments', authenticateJWT, getUserEnrollments);

// [Admin] Obtener usuarios inscritos en un curso
router.get('/admin/courses/:courseId/enrollments', autenticar, soloAdmin, getAdminCourseEnrollments);

// [Admin] Inscripciones de todos los cursos, filtradas y paginadas (pestaña Reservas)
router.get('/admin/enrollments', autenticar, soloAdmin, getAdminEnrollments);

export default router;
