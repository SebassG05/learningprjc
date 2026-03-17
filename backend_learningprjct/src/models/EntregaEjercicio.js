import mongoose from 'mongoose';

const entregaEjercicioSchema = new mongoose.Schema({
  ejercicioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ejercicio',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  archivoPdf: {
    url: String,
    publicId: String,
    nombreOriginal: String
  },
  comentarios: {
    type: String,
    maxlength: 2000
  },
  estado: {
    type: String,
    enum: ['enviado', 'revisado', 'aprobado', 'rechazado'],
    default: 'enviado'
  },
  calificacion: {
    type: Number,
    min: 0,
    max: 10
  },
  feedbackProfesor: {
    type: String,
    maxlength: 1000
  },
  fechaEntrega: {
    type: Date,
    default: Date.now
  },
  fechaRevision: {
    type: Date
  },
  intentos: {
    type: Number,
    default: 0
  },
  bloqueado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar entregas duplicadas y búsquedas eficientes
entregaEjercicioSchema.index({ ejercicioId: 1, userId: 1 });
entregaEjercicioSchema.index({ cursoId: 1, userId: 1 });

const EntregaEjercicio = mongoose.model('EntregaEjercicio', entregaEjercicioSchema);

export default EntregaEjercicio;
