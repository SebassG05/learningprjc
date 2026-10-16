import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import createRateLimit from '../middleware/rateLimit.js';
import { acceptTerms, getCurrentTerms, getTermsStatus } from '../controller/termsController.js';

const router = express.Router();

// Aceptar es una escritura con valor de prueba: pocas por minuto y por IP
const acceptRateLimit = createRateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Demasiadas peticiones. Espera un momento e inténtalo de nuevo.',
});

router.get('/current', getCurrentTerms);
router.get('/status/:courseId', authenticateJWT, getTermsStatus);
router.post('/accept/:courseId', acceptRateLimit, authenticateJWT, acceptTerms);

export default router;
