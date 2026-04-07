import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  tipo: { 
    type: String, 
    enum: ['pdf', 'video', 'enlace', 'documento'],
    required: true 
  },
  titulo: { type: String, required: true },
  descripcion: { type: String },
  archivo: { type: String }, // Ruta del archivo o URL
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
  image: { type: String }, // URL de la imagen
  description: { type: String },
  duration: { type: String }, // Ej: "20 horas"
  category: [{ type: String }],
  objetivosGenerales: [{ type: String }], // Array de objetivos generales
  objetivosEspecificos: [{ type: String }], // Array de objetivos específicos
  temas: [temaSchema], // Array de temas del curso
  isOpen: { type: Boolean, default: false }, // Si el curso está abierto para acceder al contenido
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
