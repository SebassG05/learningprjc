import express from 'express';
import { body } from 'express-validator';
import { createReview, getReviews } from '../controller/reviewController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Crear reseña (solo usuarios logeados)
router.post(
  '/',
  authenticateJWT,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('El rating debe ser un número entre 1 y 5'),
    body('description').notEmpty().withMessage('La descripción es obligatoria')
  ],
  createReview
);

// Listar reseñas
router.get('/', getReviews);

export default router;
