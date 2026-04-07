import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from '../models/Test.js';
import Course from '../models/Course.js';

dotenv.config();

const limpiarTestsDuplicados = async () => {
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
    
    // Obtener todos los tests del curso
    const tests = await Test.find({ cursoId }).sort({ createdAt: -1 }); // Más recientes primero
    
    console.log(`📝 Tests encontrados: ${tests.length}\n`);

    // Agrupar por titulo para encontrar duplicados
    const testMap = new Map();
    const duplicados = [];

    tests.forEach(test => {
      const key = test.titulo; // Solo el título
      if (testMap.has(key)) {
        // Ya existe, este es un duplicado (el más antiguo)
        duplicados.push(test._id);
        console.log(`❌ Duplicado encontrado: ${test.titulo}`);
        console.log(`   ID a eliminar: ${test._id}`);
      } else {
        // Es el primero (más reciente), lo guardamos
        testMap.set(key, test);
        console.log(`✅ Mantener: ${test.titulo}`);
        console.log(`   ID: ${test._id}`);
      }
    });

    if (duplicados.length > 0) {
      console.log(`\n🗑️  Eliminando ${duplicados.length} test(s) duplicado(s)...`);
      const resultado = await Test.deleteMany({ _id: { $in: duplicados } });
      console.log(`✅ ${resultado.deletedCount} test(s) eliminado(s)`);
    } else {
      console.log('\n✅ No se encontraron duplicados');
    }

    // Verificar resultado final
    const testsFinales = await Test.find({ cursoId });
    console.log(`\n📊 Tests finales en el curso: ${testsFinales.length}`);
    testsFinales.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.titulo}`);
    });

    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

limpiarTestsDuplicados();
