import express from 'express';
import { body } from 'express-validator';
import { authenticateJWT } from '../middleware/auth.js';
import createRateLimit from '../middleware/rateLimit.js';
import {
  canjearInvitacion, misCursosProfesor, noStore, vistaInvitacion,
} from '../controller/courseTeacherController.js';

export const DEFAULT_LIMITS = { vista: 30, canjear: 10 };
const WINDOW = 15 * 60 * 1000;
const MESSAGE = 'Demasiados intentos. Prueba de nuevo más tarde.';
const tokenRule = body('token').isString().trim().isLength({ min: 1, max: 200 });

// Cada router crea sus propios limitadores (contadores en memoria por IP)
export function buildProfesorRouter({ limits = DEFAULT_LIMITS } = {}) {
  const { vista, canjear } = { ...DEFAULT_LIMITS, ...limits };
  const router = express.Router();
  router.use(noStore);
  router.use(express.json());

  // POST y no GET /:token: el token no queda en la ruta ni en los registros de acceso
  router.post('/invitacion/vista', createRateLimit({ windowMs: WINDOW, max: vista, message: MESSAGE }), tokenRule, vistaInvitacion);
  router.post('/invitacion/canjear', createRateLimit({ windowMs: WINDOW, max: canjear, message: MESSAGE }), authenticateJWT, tokenRule, canjearInvitacion);
  router.get('/cursos', authenticateJWT, misCursosProfesor);
  return router;
}

export default buildProfesorRouter();
