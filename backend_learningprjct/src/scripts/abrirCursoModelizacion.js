import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const abrirCurso = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB\n');

    const titulo = 'Modelización de la Dinámica del Carbono Orgánico del Suelo';
    
    // Buscar el curso
    const curso = await Course.findOne({ title: titulo });
    
    if (!curso) {
      console.log('❌ Curso no encontrado');
      process.exit(1);
    }

    console.log(`📚 Curso: ${curso.title}`);
    console.log(`   ID: ${curso._id}`);
    console.log(`   Estado actual: ${curso.isOpen ? '✅ Abierto' : '🔒 Cerrado'}\n`);

    if (!curso.isOpen) {
      console.log('🔓 Abriendo el curso...');
      curso.isOpen = true;
      await curso.save();
      console.log('✅ Curso actualizado correctamente');
    } else {
      console.log('✅ El curso ya está abierto');
    }

    console.log('\n📊 Información del curso:');
    console.log(`   • Temas: ${curso.temas.length}`);
    console.log(`   • Duración: ${curso.duration}`);
    console.log(`   • Imagen: ${curso.image ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   • Estado: ${curso.isOpen ? '✅ ABIERTO (visible y accesible)' : '🔒 Cerrado'}`);

    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

abrirCurso();
