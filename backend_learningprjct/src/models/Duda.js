import mongoose from 'mongoose';

export const DUDA_LIMITS = { titulo: 120, texto: 2000, respuesta: 2000, motivo: 300 };

const reporteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  motivo: { type: String, trim: true, maxlength: DUDA_LIMITS.motivo, default: '' },
  at: { type: Date, default: Date.now },
}, { _id: false });

const respuestaSchema = new mongoose.Schema({
  // null si la cuenta se borró; nunca se expone en la API
  autorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  autorNombre: { type: String, trim: true, default: null },
  rol: { type: String, enum: ['alumno', 'profesor', 'equipo'], required: true },
  texto: { type: String, required: true, trim: true, maxlength: DUDA_LIMITS.respuesta },
  createdAt: { type: Date, default: Date.now },
  editadaAt: { type: Date, default: null },
  oculta: { type: Boolean, default: false },
  notificadoAt: { type: Date, default: null },
});

const dudaSchema = new mongoose.Schema({
  cursoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  // id de un tema del curso o 'general'
  temaId: { type: String, required: true, trim: true },
  lang: { type: String, enum: ['es', 'en'], default: 'es' },
  // Los cuatro campos siguientes quedan a null al retirar la duda: el dato se borra de verdad
  autorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  autorNombre: { type: String, trim: true, default: null },
  titulo: { type: String, trim: true, maxlength: DUDA_LIMITS.titulo, default: null },
  texto: { type: String, trim: true, maxlength: DUDA_LIMITS.texto, default: null },
  retirada: { type: Boolean, default: false },
  estado: { type: String, enum: ['abierta', 'respondida', 'resuelta'], default: 'abierta' },
  fijada: { type: Boolean, default: false },
  oculta: { type: Boolean, default: false },
  reportes: { type: [reporteSchema], default: [] },
  respuestas: { type: [respuestaSchema], default: [] },
  ultimaActividad: { type: Date, default: Date.now },
  respuestaNoVista: { type: Boolean, default: false },
  notificado: {
    nuevaAt: { type: Date, default: null },
  },
}, { timestamps: true });

dudaSchema.index({ cursoId: 1, temaId: 1, ultimaActividad: -1 });
dudaSchema.index({ cursoId: 1, estado: 1 });

export default mongoose.model('Duda', dudaSchema);
