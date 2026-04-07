import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Test from '../models/Test.js';
import Ejercicio from '../models/Ejercicio.js';

dotenv.config();

const verificarCurso = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB\n');

    const titulo = 'Modelización de la Dinámica del Carbono Orgánico del Suelo';
    
    // Buscar curso por título
    const curso = await Course.findOne({ title: titulo });
    if (!curso) {
      console.log('❌ Curso no encontrado');
      process.exit(1);
    }

    const cursoId = curso._id.toString();

    // Obtener tests
    const tests = await Test.find({ cursoId });
    
    // Obtener ejercicios
    const ejercicios = await Ejercicio.find({ cursoId });

    console.log('╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║          📊 RESUMEN DEL CURSO DE MODELIZACIÓN DE CARBONO            ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

    console.log(`📚 ${curso.title}`);
    console.log(`   ID: ${curso._id}`);
    console.log(`   Duración: ${curso.duration}`);
    console.log(`   Estado: ${curso.isOpen ? '✅ Abierto' : '🔒 Cerrado'}`);
    console.log(`   Imagen: ${curso.image ? '✅ Configurada' : '❌ No configurada'}`);
    
    console.log('\n📖 TEMAS:');
    curso.temas.forEach((tema, index) => {
      console.log(`   ${index + 1}. ${tema.titulo}`);
      console.log(`      • Materiales: ${tema.materiales.length}`);
      console.log(`      • ID: ${tema._id}`);
    });

    console.log(`\n📝 TESTS DE EVALUACIÓN: ${tests.length}`);
    tests.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.titulo}`);
      console.log(`      • Preguntas: ${test.preguntas.length}`);
      console.log(`      • Duración: ${test.duracionMinutos} minutos`);
      console.log(`      • Nota mínima: ${test.notaMinima}%`);
    });

    console.log(`\n🎯 EJERCICIOS PRÁCTICOS: ${ejercicios.length}`);
    ejercicios.forEach((ejercicio, index) => {
      console.log(`   ${index + 1}. ${ejercicio.titulo}`);
      console.log(`      • Tipo: ${ejercicio.tipo}`);
      console.log(`      • Dificultad: ${ejercicio.dificultad}`);
      console.log(`      • Duración estimada: ${ejercicio.duracionEstimada}`);
      console.log(`      • Optativo: ${ejercicio.esOptativo ? 'Sí' : 'No'}`);
    });

    console.log('\n' + '═'.repeat(70));
    console.log('✅ ESTRUCTURA COMPLETA:');
    console.log(`   • ${curso.temas.length} temas principales`);
    console.log(`   • ${tests.length} tests de evaluación`);
    console.log(`   • ${ejercicios.length} ejercicios prácticos`);
    console.log('═'.repeat(70) + '\n');

    await mongoose.connection.close();
    console.log('✓ Conexión cerrada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verificarCurso();
