import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import createRateLimit from '../middleware/rateLimit.js';
import { canjearInvitacion, verInvitacion } from '../controller/cohortInviteController.js';

const router = express.Router();

// Frena el tanteo de tokens: 10 canjes y 30 consultas por IP cada 15 minutos
const redeemRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiados intentos de canjear invitaciones. Espera unos minutos y vuelve a probar.',
});
const previewRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Demasiadas consultas de invitaciones. Espera unos minutos y vuelve a probar.',
});

// ============= Invitaciones (alumnos) =============
router.get('/invitations/preview', previewRateLimit, verInvitacion);
router.post('/invitations/redeem', redeemRateLimit, authenticateJWT, canjearInvitacion);

export default router;
