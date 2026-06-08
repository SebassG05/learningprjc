import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const consultar = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const courses = mongoose.connection.db.collection('courses');
    const curso = await courses.findOne({ title: { $regex: 'Desarrollo de Aplicaciones Web', $options: 'i' } });

    if (!curso) {
      console.log('❌ Curso no encontrado');
      process.exit(1);
    }

    console.log(`📚 Curso: "${curso.title}"`);
    console.log(`   ID: ${curso._id}\n`);

    console.log('📖 Temas:');
    curso.temas.forEach(t => {
      console.log(`  Tema ${t.numeroTema}: "${t.titulo || t.tituloEn}" | ID: ${t._id}`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

consultar();
