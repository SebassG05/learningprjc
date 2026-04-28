import mongoose from 'mongoose';

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

const temaSchema = new mongoose.Schema({
  numeroTema: { type: Number, required: true },
  titulo: { type: String }, // Título en español (opcional si tituloEn existe)
  tituloEn: { type: String }, // Título en inglés (opcional si titulo existe)
  descripcion: { type: String },
  descripcionEn: { type: String }, // Descripción en inglés (opcional)
  orden: { type: Number, default: 0 }, // Orden de visualización del tema
  materiales: [materialSchema],
  actividadesOptativas: [materialSchema], // Actividades optativas del tema
  completado: { type: Boolean, default: false }
}, { _id: true });

// Validación personalizada para temas: al menos un título debe existir
temaSchema.pre('validate', function(next) {
  if (!this.titulo && !this.tituloEn) {
    return next(new Error('El tema debe tener al menos un título (en español o inglés)'));
  }
  next();
});

const courseSchema = new mongoose.Schema({
  title: { type: String }, // Título en español (opcional si titleEn existe)
  titleEn: { type: String }, // Título en inglés (opcional si title existe)
  image: { type: String }, // URL de la imagen
  description: { type: String }, // Descripción en español (opcional si descriptionEn existe)
  descriptionEn: { type: String }, // Descripción en inglés (opcional)
  duration: { type: String }, // Ej: "20 horas"
  category: [{ type: String }],
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
}, { timestamps: true });

// Validación personalizada: al menos uno de los títulos debe existir
courseSchema.pre('validate', function(next) {
  if (!this.title && !this.titleEn) {
    return next(new Error('El curso debe tener al menos un título (en español o inglés)'));
  }
  if (!this.description && !this.descriptionEn) {
    return next(new Error('El curso debe tener al menos una descripción (en español o inglés)'));
  }
  next();
});

export default mongoose.model('Course', courseSchema);
