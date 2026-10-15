import mongoose from 'mongoose';

export const REVIEW_MAX_LENGTH = 2000;

const reviewSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    trim: true
  },
  // Autor (las reseñas antiguas no lo tienen). No se expone en la API: marca las propias y permite
  // editarlas o borrarlas.
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

// Reseñas de un autor, de la más reciente a la más antigua (el límite diario vive en User.lastReviewAt)
reviewSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
