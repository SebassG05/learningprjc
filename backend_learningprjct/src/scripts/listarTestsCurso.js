import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from '../models/Test.js';
import Course from '../models/Course.js';

dotenv.config();

const listarTestsCurso = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB\n');

    const titulo = 'Modelización de la Dinámica del Carbono Orgánico del Suelo';
    const curso = await Course.findOne({ title: titulo });
    
    if (!curso) {
      console.log('❌ Curso no encontrado');
      process.exit(1);
    }

    const tests = await Test.find({ cursoId: curso._id.toString() }).sort({ titulo: 1 });
    
    console.log(`📝 Tests del curso (${tests.length}):\n`);
    tests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.titulo}`);
      console.log(`   TemaId: ${test.temaId}`);
      console.log(`   Preguntas: ${test.preguntas.length}`);
      console.log(`   Duración: ${test.duracionMinutos} min`);
      console.log(`   Nota mínima: ${test.notaMinima}%`);
      console.log('');
    });

    // Verificar si hay test final
    const testFinal = tests.find(t => t.titulo.toLowerCase().includes('final'));
    if (testFinal) {
      console.log('✅ Test Final encontrado');
      console.log(`   ID: ${testFinal._id}`);
      console.log(`   TemaId: ${testFinal.temaId}`);
    } else {
      console.log('⚠️  NO se encontró Test Final de Certificación');
    }

    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listarTestsCurso();
