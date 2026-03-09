import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const listarTemas = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    const cursoId = '69a6a0a4c8289d012745af63';
    const curso = await Course.findById(cursoId);

    if (!curso) {
      console.log('✗ Curso no encontrado');
      process.exit(1);
    }

    console.log(`\n📚 Curso: ${curso.titulo}`);
    console.log(`\n📋 Temas del curso:\n`);
    
    curso.temas.forEach((tema, index) => {
      console.log(`${index + 1}. ${tema.titulo}`);
      console.log(`   ID: ${tema._id}`);
      console.log(`   Descripción: ${tema.descripcion.substring(0, 80)}...`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✓ Conexión cerrada');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

listarTemas();
