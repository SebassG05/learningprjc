import mongoose from 'mongoose';

export const REVIEW_MAX_LENGTH = 2000;

const reviewSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    trim: true
  },
  // Autor (las reseñas antiguas no lo tienen). No se expone en la API: solo sirve para marcar las propias.
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
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
  }
});

export default mongoose.model('Review', reviewSchema);
