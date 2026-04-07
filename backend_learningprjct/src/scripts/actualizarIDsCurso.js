import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Test from '../models/Test.js';
import Ejercicio from '../models/Ejercicio.js';

dotenv.config();

const actualizarIDsCurso = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB\n');

    const titulo = 'Modelización de la Dinámica del Carbono Orgánico del Suelo';
    
    // Buscar el curso más reciente
    const curso = await Course.findOne({ title: titulo }).sort({ createdAt: -1 });
    
    if (!curso) {
      console.log('❌ Curso no encontrado');
      process.exit(1);
    }

    const nuevoID = curso._id.toString();
    console.log(`📚 Curso encontrado: ${curso.title}`);
    console.log(`   ID: ${nuevoID}\n`);

    // Mapeo de IDs de temas
    const temasMap = {};
    curso.temas.forEach((tema, index) => {
      temasMap[index + 1] = tema._id.toString();
    });

    console.log('📖 IDs de temas:');
    curso.temas.forEach((tema, index) => {
      console.log(`   Tema ${index + 1}: ${tema._id}`);
    });

    // Actualizar todos los tests huérfanos (que no encuentran el curso)
    console.log('\n🔄 Actualizando tests...');
    
    const tests = await Test.find({});
    let testsActualizados = 0;
    let testActualizacionesIndividuales = [];

    for (const test of tests) {
      let actualizado = false;
      const update = {};

      // Actualizar cursoId si no coincide
      if (test.cursoId !== nuevoID) {
        update.cursoId = nuevoID;
        actualizado = true;
      }

      // Actualizar temaId basado en el título del test
      if (test.titulo.includes('Tema 1')) {
        if (test.temaId !== temasMap[1]) {
          update.temaId = temasMap[1];
          actualizado = true;
        }
      } else if (test.titulo.includes('Tema 2')) {
        if (test.temaId !== temasMap[2]) {
          update.temaId = temasMap[2];
          actualizado = true;
        }
      } else if (test.titulo.includes('Tema 3')) {
        if (test.temaId !== temasMap[3]) {
          update.temaId = temasMap[3];
          actualizado = true;
        }
      } else if (test.titulo.includes('Tema 4')) {
        if (test.temaId !== temasMap[4]) {
          update.temaId = temasMap[4];
          actualizado = true;
        }
      }
      // Test final mantiene su temaId especial

      if (actualizado) {
        await Test.findByIdAndUpdate(test._id, update);
        testsActualizados++;
        testActualizacionesIndividuales.push(test.titulo);
        console.log(`   ✅ ${test.titulo}`);
      }
    }

    console.log(`\n✅ ${testsActualizados} test(s) actualizado(s)`);

    // Actualizar ejercicios
    console.log('\n🔄 Actualizando ejercicios...');
    const ejercicios = await Ejercicio.find({});
    let ejerciciosActualizados = 0;

    for (const ejercicio of ejercicios) {
      if (ejercicio.cursoId !== nuevoID) {
        await Ejercicio.findByIdAndUpdate(ejercicio._id, { cursoId: nuevoID });
        ejerciciosActualizados++;
        console.log(`   ✅ ${ejercicio.titulo}`);
      }
    }

    console.log(`\n✅ ${ejerciciosActualizados} ejercicio(s) actualizado(s)`);

    console.log('\n' + '═'.repeat(70));
    console.log('✅ ACTUALIZACIÓN COMPLETADA');
    console.log('═'.repeat(70) + '\n');

    await mongoose.connection.close();
    console.log('✓ Conexión cerrada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

actualizarIDsCurso();
