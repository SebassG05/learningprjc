import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const getCurso = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const courses = mongoose.connection.db.collection('courses');
  const course = await courses.findOne({ _id: new mongoose.Types.ObjectId('6a196249d733b54cd47d6e0a') });
  if (!course) { console.log('Curso no encontrado'); process.exit(1); }
  console.log('Curso:', course.titulo);
  console.log('\nTemas:');
  course.temas.forEach(t => {
    console.log(`  Tema ${t.numeroTema} | _id: ${t._id} | ${t.titulo}`);
  });
  await mongoose.disconnect();
};

getCurso().catch(err => { console.error(err); process.exit(1); });
