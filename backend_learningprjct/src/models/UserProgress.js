import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['enrolled', 'completed'],
    default: 'enrolled'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  preferredLanguage: {
    type: String,
    enum: ['es', 'en'],
    default: 'es'
  }, // Idioma preferido del usuario para este curso
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedMaterials: [{
    type: String // IDs de materiales completados
  }],
  completedTests: [{
    type: String // IDs de tests aprobados
  }]
}, { 
  timestamps: true 
});

// Índice compuesto para evitar duplicados
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('UserProgress', userProgressSchema);
