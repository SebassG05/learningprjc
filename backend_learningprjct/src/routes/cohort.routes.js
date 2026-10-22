import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { autenticar, soloAdmin } from '../middleware/authorization.js';
import createRateLimit from '../middleware/rateLimit.js';
import { canjearInvitacion, verInvitacion } from '../controller/cohortInviteController.js';
import {
  actualizarCohorte,
  anadirMiembros,
  crearCohorte,
  crearInvitacion,
  eliminarCohorte,
  listarCohortes,
  listarInvitaciones,
  quitarMiembro,
  revocarInvitacion,
} from '../controller/cohortAdminController.js';

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

// ============= Administración =============
const admin = [autenticar, soloAdmin];

router.get('/', ...admin, listarCohortes);
router.post('/', ...admin, crearCohorte);
router.put('/:id', ...admin, actualizarCohorte);
router.delete('/:id', ...admin, eliminarCohorte);

router.post('/:id/members', ...admin, anadirMiembros);
router.delete('/:id/members/:memberId', ...admin, quitarMiembro);

router.get('/:id/invites', ...admin, listarInvitaciones);
router.post('/:id/invites', ...admin, crearInvitacion);
router.post('/:id/invites/:inviteId/revoke', ...admin, revocarInvitacion);

export default router;
