import Review from '../models/Review.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

const isProduction = process.env.NODE_ENV === 'production';
const serverError = (res, err) =>
  res.status(500).json({ error: 'Error en el servidor', ...(isProduction ? {} : { details: err.message }) });

// Forma pública de una reseña: nunca expone userId; marca `mine` si es del usuario que pregunta
const toPublic = (review, viewerId) => {
  const { userId, __v, ...rest } = review;
  return viewerId && userId && String(userId) === String(viewerId) ? { ...rest, mine: true } : rest;
};

export const createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { rating, description } = req.body;
  try {
    // El nombre sale de la cuenta, no del cuerpo de la petición (no se puede firmar como otro)
    const account = req.user?.id ? await User.findById(req.user.id).select('name email').lean() : null;
    const user = account?.name || account?.email?.split('@')[0] || req.user?.email?.split('@')[0] || 'Usuario';
    const review = new Review({ user, userId: account?._id, rating, description });
    await review.save();
    res.status(201).json({ message: 'Reseña creada correctamente', review: toPublic(review.toObject(), req.user?.id) });
  } catch (err) {
    serverError(res, err);
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    res.json(reviews.map((r) => toPublic(r, req.user?.id)));
  } catch (err) {
    serverError(res, err);
  }
};
