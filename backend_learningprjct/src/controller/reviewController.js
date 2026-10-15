import Review from '../models/Review.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

const isProduction = process.env.NODE_ENV === 'production';
const serverError = (res, err) =>
  res.status(500).json({ error: 'Error en el servidor', ...(isProduction ? {} : { details: err.message }) });

const ALREADY_REVIEWED = 'Ya has publicado una reseña. Puedes editarla o borrarla.';

// Forma pública de una reseña: nunca expone userId; marca `mine` si es del usuario que pregunta
const toPublic = (review, viewerId) => {
  const { userId, __v, ...rest } = review;
  return viewerId && userId && String(userId) === String(viewerId) ? { ...rest, mine: true } : rest;
};

const isOwner = (review, userId) => Boolean(review.userId && userId && String(review.userId) === String(userId));

const validationFailed = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ errors: errors.array() });
  return true;
};

export const createReview = async (req, res) => {
  if (validationFailed(req, res)) return;
  const { rating, description } = req.body;
  try {
    const account = req.user?.id ? await User.findById(req.user.id).select('name email').lean() : null;
    // Una reseña por cuenta: si ya hay una, se edita en lugar de crear otra
    if (account && (await Review.exists({ userId: account._id }))) {
      return res.status(409).json({ error: ALREADY_REVIEWED });
    }
    // El nombre sale de la cuenta, no del cuerpo de la petición (no se puede firmar como otro)
    const user = account?.name || account?.email?.split('@')[0] || req.user?.email?.split('@')[0] || 'Usuario';
    const review = new Review({ user, userId: account?._id, rating, description });
    await review.save();
    res.status(201).json({ message: 'Reseña creada correctamente', review: toPublic(review.toObject(), req.user?.id) });
  } catch (err) {
    // Dos envíos simultáneos: el índice único frena el segundo
    if (err?.code === 11000) return res.status(409).json({ error: ALREADY_REVIEWED });
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

// Solo su autor puede editarla
export const updateReview = async (req, res) => {
  if (validationFailed(req, res)) return;
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'La reseña no existe' });
    if (!isOwner(review, req.user?.id)) return res.status(403).json({ error: 'Solo puedes editar tu propia reseña' });
    review.rating = req.body.rating;
    review.description = req.body.description;
    review.updatedAt = new Date();
    await review.save();
    res.json({ message: 'Reseña actualizada', review: toPublic(review.toObject(), req.user.id) });
  } catch (err) {
    serverError(res, err);
  }
};

// Su autor puede borrarla; un administrador también (moderación)
export const deleteReview = async (req, res) => {
  if (validationFailed(req, res)) return;
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'La reseña no existe' });
    if (!isOwner(review, req.user?.id)) {
      const account = await User.findById(req.user?.id).select('role').lean();
      if (!['admin', 'superadmin'].includes(account?.role)) {
        return res.status(403).json({ error: 'Solo puedes borrar tu propia reseña' });
      }
    }
    await review.deleteOne();
    res.json({ message: 'Reseña eliminada', id: String(review._id) });
  } catch (err) {
    serverError(res, err);
  }
};
