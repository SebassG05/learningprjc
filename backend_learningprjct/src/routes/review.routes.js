import express from 'express';
import { body, param } from 'express-validator';
import { createReview, deleteReview, getReviewStatus, getReviews, updateReview } from '../controller/reviewController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import createRateLimit from '../middleware/rateLimit.js';
import { REVIEW_MAX_LENGTH } from '../models/Review.js';

const router = express.Router();

// Pocas escrituras seguidas por IP: frena spam sin molestar a un alumno real
const reviewRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Has publicado varias reseñas seguidas. Espera un rato e inténtalo de nuevo.',
});
const editRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Has hecho muchos cambios seguidos. Espera un rato e inténtalo de nuevo.',
});

const reviewFields = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('El rating debe ser un número entre 1 y 5'),
  body('description')
    .trim()
    .notEmpty().withMessage('La descripción es obligatoria')
    .isLength({ max: REVIEW_MAX_LENGTH }).withMessage(`La reseña no puede superar los ${REVIEW_MAX_LENGTH} caracteres`),
];
const reviewId = param('id').isMongoId().withMessage('Identificador de reseña no válido');

// Listar reseñas (pública; con sesión marca las propias)
router.get('/', optionalAuth, getReviews);

// Con sesión: si ya puede publicar o cuándo podrá (una reseña cada 24 h)
router.get('/status', authenticateJWT, getReviewStatus);

// Crear reseña (solo usuarios logeados; una cada 24 h por cuenta)
router.post('/', authenticateJWT, reviewRateLimit, reviewFields, createReview);

// Editar o borrar la propia
router.put('/:id', authenticateJWT, editRateLimit, [reviewId, ...reviewFields], updateReview);
router.delete('/:id', authenticateJWT, editRateLimit, [reviewId], deleteReview);

export default router;
