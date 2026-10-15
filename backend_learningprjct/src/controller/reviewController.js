import Review from '../models/Review.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

const isProduction = process.env.NODE_ENV === 'production';
const serverError = (res, err) =>
  res.status(500).json({ error: 'Error en el servidor', ...(isProduction ? {} : { details: err.message }) });

// Una reseña cada 24 h por cuenta. El plazo vive en User.lastReviewAt: borrar la reseña no lo reabre.
export const REVIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const COOLDOWN_MESSAGE = 'Ya has publicado una reseña hoy. Podrás escribir otra cuando pasen 24 horas.';
const nextReviewAt = (lastReviewAt) =>
  lastReviewAt && Date.now() - new Date(lastReviewAt).getTime() < REVIEW_COOLDOWN_MS
    ? new Date(new Date(lastReviewAt).getTime() + REVIEW_COOLDOWN_MS)
    : null;

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

const cooldown = (res, until) => {
  res.set('Retry-After', String(Math.max(1, Math.ceil((until.getTime() - Date.now()) / 1000))));
  return res.status(429).json({ error: COOLDOWN_MESSAGE, nextReviewAt: until });
};

export const createReview = async (req, res) => {
  if (validationFailed(req, res)) return;
  const { rating, description } = req.body;
  try {
    const account = await User.findById(req.user?.id).select('name email lastReviewAt').lean();
    if (!account) return res.status(401).json({ error: 'Usuario no encontrado' });

    // Reserva el plazo de forma atómica: dos envíos a la vez no pueden pasar los dos
    const now = new Date();
    const claimed = await User.findOneAndUpdate(
      { _id: account._id, $or: [{ lastReviewAt: null }, { lastReviewAt: { $lte: new Date(now.getTime() - REVIEW_COOLDOWN_MS) } }] },
      { $set: { lastReviewAt: now } },
      { new: false }
    ).select('lastReviewAt').lean();
    if (!claimed) {
      const fresh = await User.findById(account._id).select('lastReviewAt').lean();
      return cooldown(res, nextReviewAt(fresh?.lastReviewAt) ?? new Date(now.getTime() + REVIEW_COOLDOWN_MS));
    }

    // El nombre sale de la cuenta, no del cuerpo de la petición (no se puede firmar como otro)
    const user = account.name || account.email?.split('@')[0] || 'Usuario';
    try {
      const review = new Review({ user, userId: account._id, rating, description });
      await review.save();
      res.status(201).json({
        message: 'Reseña creada correctamente',
        review: toPublic(review.toObject(), req.user.id),
        nextReviewAt: new Date(now.getTime() + REVIEW_COOLDOWN_MS),
      });
    } catch (err) {
      // No se publicó: se devuelve el plazo a como estaba
      await User.updateOne({ _id: account._id }, { $set: { lastReviewAt: claimed.lastReviewAt ?? null } });
      throw err;
    }
  } catch (err) {
    serverError(res, err);
  }
};

// Con sesión: cuándo puede publicar la siguiente (null si ya puede)
export const getReviewStatus = async (req, res) => {
  try {
    const account = await User.findById(req.user?.id).select('lastReviewAt').lean();
    if (!account) return res.status(401).json({ error: 'Usuario no encontrado' });
    const next = nextReviewAt(account.lastReviewAt);
    res.json({ canPost: !next, nextReviewAt: next });
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

// Solo su autor puede editarla (editar no consume el plazo diario)
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
