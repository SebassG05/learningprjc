import express from 'express';
import { body } from 'express-validator';
import { createReview, getReviews } from '../controller/reviewController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import createRateLimit from '../middleware/rateLimit.js';
import { REVIEW_MAX_LENGTH } from '../models/Review.js';

const router = express.Router();

// Pocas reseñas seguidas por IP: frena spam sin molestar a un alumno real
const reviewRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Has publicado varias reseñas seguidas. Espera un rato e inténtalo de nuevo.',
});

// Crear reseña (solo usuarios logeados)
router.post(
  '/',
  authenticateJWT,
  reviewRateLimit,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('El rating debe ser un número entre 1 y 5'),
    body('description')
      .trim()
      .notEmpty().withMessage('La descripción es obligatoria')
      .isLength({ max: REVIEW_MAX_LENGTH }).withMessage(`La reseña no puede superar los ${REVIEW_MAX_LENGTH} caracteres`)
  ],
  createReview
);

// Listar reseñas (pública; con sesión marca las propias)
router.get('/', optionalAuth, getReviews);

export default router;
