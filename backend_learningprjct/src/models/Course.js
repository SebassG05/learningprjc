import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String }, // URL de la imagen
  description: { type: String },
  duration: { type: String }, // Ej: "20 horas"
  category: [{ type: String }],
  objetivosGenerales: [{ type: String }], // Array de objetivos generales
  objetivosEspecificos: [{ type: String }], // Array de objetivos específicos
  // Puedes añadir más campos si lo necesitas
});

export default mongoose.model('Course', courseSchema);
