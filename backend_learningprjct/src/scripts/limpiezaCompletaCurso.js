import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Test from '../models/Test.js';
import Ejercicio from '../models/Ejercicio.js';

dotenv.config();

const limpiezaCompleta = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB\n');

    console.log('🧹 LIMPIEZA COMPLETA DE CURSOS DUPLICADOS\n');
    console.log('═'.repeat(70) + '\n');

    // Buscar todos los cursos con el mismo título
    const titulo = 'Modelización de la Dinámica del Carbono Orgánico del Suelo';
    const cursos = await Course.find({ title: titulo });

    console.log(`📚 Cursos encontrados con el título: ${cursos.length}\n`);

    if (cursos.length === 0) {
      console.log('✅ No hay cursos para limpiar');
      await mongoose.connection.close();
      return;
    }

    // Mostrar todos los cursos encontrados
    cursos.forEach((curso, index) => {
      console.log(`${index + 1}. ID: ${curso._id}`);
      console.log(`   Creado: ${curso.createdAt}`);
      console.log(`   Temas: ${curso.temas.length}`);
      console.log(`   Imagen: ${curso.image ? '✅' : '❌'}`);
      console.log('');
    });

    // Eliminar todos los cursos
    console.log('🗑️  Eliminando todos los cursos duplicados...');
    const resultadoCursos = await Course.deleteMany({ title: titulo });
    console.log(`✅ ${resultadoCursos.deletedCount} curso(s) eliminado(s)\n`);

    // Eliminar todos los tests asociados
    console.log('🗑️  Eliminando tests asociados...');
    const cursosIds = cursos.map(c => c._id.toString());
    const resultadoTests = await Test.deleteMany({ cursoId: { $in: cursosIds } });
    console.log(`✅ ${resultadoTests.deletedCount} test(s) eliminado(s)\n`);

    // Eliminar todos los ejercicios asociados
    console.log('🗑️  Eliminando ejercicios asociados...');
    const resultadoEjercicios = await Ejercicio.deleteMany({ cursoId: { $in: cursosIds } });
    console.log(`✅ ${resultadoEjercicios.deletedCount} ejercicio(s) eliminado(s)\n`);

    console.log('═'.repeat(70));
    console.log('✅ LIMPIEZA COMPLETADA');
    console.log('═'.repeat(70) + '\n');

    await mongoose.connection.close();
    console.log('✓ Conexión cerrada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

limpiezaCompleta();
