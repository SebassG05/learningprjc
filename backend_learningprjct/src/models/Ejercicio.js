import mongoose from 'mongoose';

const ejercicioSchema = new mongoose.Schema({
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  temaId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Si es null, se muestra después del test final
  },
  orden: {
    type: Number,
    default: 1
  },
  titulo: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['simulacion', 'practica', 'analisis', 'investigacion'],
    default: 'practica'
  },
  contexto: {
    type: String,
    required: true
  },
  enunciado: {
    type: String,
    required: true
  },
  pasos: [{
    numero: Number,
    titulo: String,
    descripcion: String,
    detalles: [String]
  }],
  entregable: {
    descripcion: String,
    preguntas: [String],
    limiteCaracteres: Number
  },
  recursos: [{
    tipo: String, // 'enlace', 'herramienta', 'documento'
    titulo: String,
    url: String,
    descripcion: String
  }],
  duracionEstimada: {
    type: String,
    default: '2-3 horas'
  },
  dificultad: {
    type: String,
    enum: ['basico', 'intermedio', 'avanzado'],
    default: 'intermedio'
  },
  esOptativo: {
    type: Boolean,
    default: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice compuesto para búsquedas eficientes
ejercicioSchema.index({ cursoId: 1, temaId: 1, orden: 1 });

const Ejercicio = mongoose.model('Ejercicio', ejercicioSchema);

export default Ejercicio;
