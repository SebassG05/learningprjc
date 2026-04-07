import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const agregarTemaFinal = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    const cursoId = '69d500ea93355c0ba4b809a8';
    
    const temaFinal = {
      titulo: 'Test Final de Certificación',
      descripcion: 'Test final integrador que evalúa todos los conocimientos adquiridos durante el curso sobre modelización de la dinámica del carbono orgánico del suelo. Aprobar este test es requisito obligatorio para obtener el certificado del curso.',
      orden: 5,
      materiales: [] // No tiene materiales, solo el test
    };

    const curso = await Course.findByIdAndUpdate(
      cursoId,
      { $push: { temas: temaFinal } },
      { new: true }
    );

    if (!curso) {
      console.log('✗ Curso no encontrado');
      process.exit(1);
    }

    const nuevoTema = curso.temas[curso.temas.length - 1];
    console.log('\n✓ Tema Final agregado correctamente');
    console.log(`\nID del nuevo tema: ${nuevoTema._id}`);
    console.log(`Título: ${nuevoTema.titulo}`);

    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

agregarTemaFinal();
