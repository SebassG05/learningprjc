import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ejercicio from '../models/Ejercicio.js';
import Course from '../models/Course.js';

dotenv.config();

const limpiarEjerciciosDuplicados = async () => {
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
    
    // Obtener todos los ejercicios del curso
    const ejercicios = await Ejercicio.find({ cursoId }).sort({ createdAt: -1 }); // Más recientes primero
    
    console.log(`📝 Ejercicios encontrados: ${ejercicios.length}\n`);

    // Ag rupar por titulo para encontrar duplicados
    const ejercicioMap = new Map();
    const duplicados = [];

    ejercicios.forEach(ejercicio => {
      const key = ejercicio.titulo; // Solo el título
      if (ejercicioMap.has(key)) {
        // Ya existe, este es un duplicado (el más antiguo)
        duplicados.push(ejercicio._id);
        console.log(`❌ Duplicado encontrado: ${ejercicio.titulo}`);
        console.log(`   ID a eliminar: ${ejercicio._id}`);
      } else {
        // Es el primero (más reciente), lo guardamos
        ejercicioMap.set(key, ejercicio);
        console.log(`✅ Mantener: ${ejercicio.titulo}`);
        console.log(`   ID: ${ejercicio._id}`);
      }
    });

    if (duplicados.length > 0) {
      console.log(`\n🗑️  Eliminando ${duplicados.length} ejercicio(s) duplicado(s)...`);
      const resultado = await Ejercicio.deleteMany({ _id: { $in: duplicados } });
      console.log(`✅ ${resultado.deletedCount} ejercicio(s) eliminado(s)`);
    } else {
      console.log('\n✅ No se encontraron duplicados');
    }

    // Verificar resultado final
    const ejerciciosFinales = await Ejercicio.find({ cursoId });
    console.log(`\n📊 Ejercicios finales en el curso: ${ejerciciosFinales.length}`);
    ejerciciosFinales.forEach((ejercicio, index) => {
      console.log(`   ${index + 1}. ${ejercicio.titulo}`);
    });

    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

limpiarEjerciciosDuplicados();
