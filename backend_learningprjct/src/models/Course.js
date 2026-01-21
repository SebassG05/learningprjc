import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String }, // URL de la imagen
  description: { type: String },
  duration: { type: String }, // Ej: "20 horas"
  category: [{ type: String }],
  // Puedes añadir más campos si lo necesitas
});

export default mongoose.model('Course', courseSchema);
