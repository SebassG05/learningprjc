import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  tipo: { 
    type: String, 
    enum: ['pdf', 'video', 'enlace', 'documento'],
    required: true 
  },
  titulo: { type: String, required: true },
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
  titulo: { type: String, required: true },
  descripcion: { type: String },
  materiales: [materialSchema],
  actividadesOptativas: [materialSchema], // Actividades optativas del tema
  completado: { type: Boolean, default: false }
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleEn: { type: String }, // Título en inglés (opcional)
  image: { type: String }, // URL de la imagen
  description: { type: String },
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

export default mongoose.model('Course', courseSchema);
