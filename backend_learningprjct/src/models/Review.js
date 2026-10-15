import mongoose from 'mongoose';

export const REVIEW_MAX_LENGTH = 2000;

const reviewSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    trim: true
  },
  // Autor (las reseñas antiguas no lo tienen). No se expone en la API: marca las propias y limita a
  // una reseña por cuenta.
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: REVIEW_MAX_LENGTH
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Una reseña por cuenta (solo cuenta las que tienen autor: las antiguas no chocan entre sí)
reviewSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true } } });

export default mongoose.model('Review', reviewSchema);
