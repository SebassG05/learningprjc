import Review from '../models/Review.js';
import { validationResult } from 'express-validator';

export const createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { rating, description } = req.body;
  const user = req.user?.email || req.user?.name || 'Usuario';
  try {
    const review = new Review({ user, rating, description });
    await review.save();
    res.status(201).json({ message: 'Reseña creada correctamente', review });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};
