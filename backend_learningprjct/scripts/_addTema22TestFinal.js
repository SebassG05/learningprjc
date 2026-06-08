import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const addTema22 = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const courses = mongoose.connection.db.collection('courses');
    const cursoId = new mongoose.Types.ObjectId('6a196249d733b54cd47d6e0a');

    const course = await courses.findOne({ _id: cursoId });
    if (!course) { console.log('❌ Curso no encontrado'); process.exit(1); }

    // Verificar que no exista ya un Tema 22
    const yaExiste = course.temas.find(t => t.numeroTema === 22);
    if (yaExiste) {
      console.log('⚠️  Ya existe el Tema 22:', yaExiste._id.toString(), '-', yaExiste.titulo);
      process.exit(0);
    }

    const nuevoTema = {
      _id: new mongoose.Types.ObjectId(),
      numeroTema: 22,
      titulo: 'Test Final de Certificación',
      descripcion: 'Evaluación final integradora que abarca todos los módulos del curso: HTML semántico, JavaScript ES6+, React 18, Node.js, Express, Git, Python, APIs REST, buenas prácticas, automatización y uso profesional de IA.',
      materiales: [],
      actividades: []
    };

    await courses.updateOne(
      { _id: cursoId },
      { $push: { temas: nuevoTema } }
    );

    console.log('✅ Tema 22 añadido al curso.');
    console.log('   temaId:', nuevoTema._id.toString());
    console.log('   Título:', nuevoTema.titulo);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

addTema22();
