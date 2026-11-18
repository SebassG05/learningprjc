import mongoose from 'mongoose';
import { AREA_SLUGS, COURSE_LEVELS, PROFESOR_LIMITS } from '../config/courseCatalog.js';

// Profesor del curso (opcional): si falta, la ficha no muestra el bloque
const profesorSchema = new mongoose.Schema({
  nombre: { type: String, trim: true, maxlength: PROFESOR_LIMITS.nombre },
  foto: { type: String }, // URL de Cloudinary
  bio: { type: String, trim: true, maxlength: PROFESOR_LIMITS.bio }
}, { _id: false });

// Profesor asignado al curso (puede resolver dudas y moderar el foro del curso). Se invita por email:
// 'pending' hasta que esa persona acepta el enlace y queda enlazada a su cuenta (userId) como 'active'.
// Solo guardamos el hash del token de invitación, nunca el token.
const profesorAsignadoSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  status: { type: String, enum: ['pending', 'active'], default: 'pending' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  tokenHash: { type: String, default: null },
  redeemedTokenHash: { type: String, default: null }, // hash del enlace ya canjeado: un segundo intento responde «usado»
  tokenExpiresAt: { type: Date, default: null },
  lastSentAt: { type: Date, default: Date.now },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedAt: { type: Date, default: Date.now },
  linkedAt: { type: Date, default: null },
}, { _id: true });

const materialSchema = new mongoose.Schema({
  tipo: { 
    type: String, 
    enum: ['pdf', 'video', 'enlace', 'documento'],
    default: 'pdf'
  },
  titulo: { type: String }, // Título del material (opcional)
  descripcion: { type: String },
  archivo: { type: String }, // Ruta del archivo o URL (versión español por defecto)
  archivoEn: { type: String }, // Ruta del archivo en inglés (opcional)
  idioma: { 
    type: String, 
    enum: ['es', 'en', 'both'], 
    default: 'es' 
  }, // 'es' = solo español, 'en' = solo inglés, 'both' = ambos idiomas disponibles
  orden: { type: Number, default: 0 }
}, { _id: true });

// Vídeo explicativo del tema: un vídeo de YouTube (oculto) o un asset de Cloudinary (resource_type video).
// Se entrega por GET /api/courses/:id/temas/:temaId/video y solo a quien puede leer el curso.
// - youtubeId: id del vídeo (11 caracteres). Si está, manda sobre Cloudinary.
// - publicId/version/type: Cloudinary. type 'authenticated': solo valen URLs firmadas.
const temaVideoSchema = new mongoose.Schema({
  youtubeId: { type: String, trim: true, match: /^[\w-]{11}$/ },
  publicId: { type: String, trim: true, required() { return !this.youtubeId; } },
  version: { type: Number },
  type: { type: String, enum: ['upload', 'authenticated'], default() { return this.youtubeId ? undefined : 'upload'; } },
}, { _id: false });

// Índice del temario agrupado por partes (como el índice del PDF)
const apartadoSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  items: [{ type: String, trim: true }],
}, { _id: false });

const temaSchema = new mongoose.Schema({
  numeroTema: { type: Number, required: true },
  titulo: { type: String }, // Título en español (opcional si tituloEn existe)
  tituloEn: { type: String }, // Título en inglés (opcional si titulo existe)
  descripcion: { type: String },
  descripcionEn: { type: String }, // Descripción en inglés (opcional)
  video: { type: temaVideoSchema, default: undefined },
  apartados: { type: [apartadoSchema], default: undefined },
  conceptosClave: { type: [{ type: String, trim: true }], default: undefined },
  orden: { type: Number, default: 0 }, // Orden de visualización del tema
  materiales: [materialSchema],
  actividadesOptativas: [materialSchema], // Actividades optativas del tema
  completado: { type: Boolean, default: false }
}, { _id: true });

// Validación personalizada para temas: al menos un título debe existir
temaSchema.pre('validate', async function() {
  const tieneTituloEs = this.titulo && this.titulo.trim && this.titulo.trim().length > 0;
  const tieneTituloEn = this.tituloEn && this.tituloEn.trim && this.tituloEn.trim().length > 0;
  
  if (!tieneTituloEs && !tieneTituloEn) {
    throw new Error('El tema debe tener al menos un título (en español o inglés)');
  }
});

const courseSchema = new mongoose.Schema({
  title: { type: String }, // Título en español (opcional si titleEn existe)
  titleEn: { type: String }, // Título en inglés (opcional si title existe)
  image: { type: String }, // URL de la imagen
  description: { type: String }, // Descripción en español (opcional si descriptionEn existe)
  descriptionEn: { type: String }, // Descripción en inglés (opcional)
  duration: { type: String }, // Ej: "20 horas"
  category: [{ type: String }], // Etiquetas libres: chips secundarios en tarjeta y ficha
  area: { type: String, enum: AREA_SLUGS }, // Área del catálogo (config/courseCatalog.js), opcional
  nivel: { type: String, enum: COURSE_LEVELS }, // Opcional
  profesor: { type: profesorSchema, default: undefined },
  objetivosGenerales: [{ type: String }], // Array de objetivos generales (español)
  objetivosGeneralesEn: [{ type: String }], // Array de objetivos generales (inglés)
  objetivosEspecificos: [{ type: String }], // Array de objetivos específicos (español)
  objetivosEspecificosEn: [{ type: String }], // Array de objetivos específicos (inglés)
  idiomasDisponibles: [{ 
    type: String, 
    enum: ['es', 'en'],
    default: ['es']
  }], // Idiomas en los que está disponible el curso
  temas: [temaSchema], // Array de temas del curso
  isOpen: { type: Boolean, default: false }, // Si el curso está abierto para acceder al contenido
  // 'private': solo miembros activos de alguna de sus cohortes (y admins) acceden al contenido.
  // La regla vive en service/courseAccess.js; los cursos sin el campo se tratan como públicos.
  accessMode: { type: String, enum: ['public', 'private'], default: 'public' },
  cohorts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cohort' }],
  // Profesores asignados. select:false: no viaja con el curso (lleva emails y hashes); se pide a propósito.
  profesores: { type: [profesorAsignadoSchema], select: false },
}, { timestamps: true });

courseSchema.index({ 'profesores.userId': 1 }); // ¿es este usuario profesor de algún curso?

// Validación personalizada: al menos uno de los títulos debe existir
courseSchema.pre('validate', async function() {
  const tieneTitleEs = this.title && this.title.trim && this.title.trim().length > 0;
  const tieneTitleEn = this.titleEn && this.titleEn.trim && this.titleEn.trim().length > 0;
  const tieneDescEs = this.description && this.description.trim && this.description.trim().length > 0;
  const tieneDescEn = this.descriptionEn && this.descriptionEn.trim && this.descriptionEn.trim().length > 0;
  
  if (!tieneTitleEs && !tieneTitleEn) {
    throw new Error('El curso debe tener al menos un título (en español o inglés)');
  }
  if (!tieneDescEs && !tieneDescEn) {
    throw new Error('El curso debe tener al menos una descripción (en español o inglés)');
  }
});

export default mongoose.model('Course', courseSchema);
