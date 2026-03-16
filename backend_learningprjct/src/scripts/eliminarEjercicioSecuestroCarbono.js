import { config } from 'dotenv';
import { connect } from 'mongoose';
import Ejercicio from '../models/Ejercicio.js';
import EntregaEjercicio from '../models/EntregaEjercicio.js';

config();

const eliminarEjercicioSecuestroCarbono = async () => {
  try {
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learningDB');
    console.log('✓ Conectado a MongoDB');

    // Buscar el ejercicio por título
    const ejercicio = await Ejercicio.findOne({ 
      titulo: 'Simulación de Secuestro de Carbono en Suelos Agrícolas'
    });

    if (!ejercicio) {
      console.log('⚠️  No se encontró el ejercicio "Simulación de Secuestro de Carbono en Suelos Agrícolas"');
      process.exit(0);
    }

    console.log(`📋 Ejercicio encontrado: ${ejercicio.titulo}`);
    console.log(`   ID: ${ejercicio._id}`);

    // Eliminar las entregas asociadas al ejercicio
    const entregas = await EntregaEjercicio.deleteMany({ ejercicioId: ejercicio._id });
    console.log(`✓ Eliminadas ${entregas.deletedCount} entregas asociadas`);

    // Eliminar el ejercicio
    await Ejercicio.findByIdAndDelete(ejercicio._id);
    console.log('✓ Ejercicio eliminado correctamente');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al eliminar el ejercicio:', error);
    process.exit(1);
  }
};

eliminarEjercicioSecuestroCarbono();
