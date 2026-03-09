import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Test from '../models/Test.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const cargarTestTema4 = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    // Leer el archivo JSON
    const testData = JSON.parse(
      readFileSync(join(__dirname, '../data/test-tema4-ejecucion-practica.json'), 'utf-8')
    );

    // Buscar si ya existe un test para este tema
    const testExistente = await Test.findOne({ 
      temaId: testData.temaId 
    });

    if (testExistente) {
      console.log('⚠️  Ya existe un test para este tema. Actualizando...');
      await Test.findByIdAndUpdate(testExistente._id, testData);
      console.log('✓ Test actualizado correctamente');
    } else {
      // Crear nuevo test
      const nuevoTest = new Test(testData);
      await nuevoTest.save();
      console.log('✓ Test creado correctamente');
    }

    console.log(`\nTest cargado con éxito:`);
    console.log(`  - Curso ID: ${testData.cursoId}`);
    console.log(`  - Tema ID: ${testData.temaId}`);
    console.log(`  - Título: ${testData.titulo}`);
    console.log(`  - Preguntas: ${testData.preguntas.length}`);
    console.log(`  - Duración: ${testData.duracionMinutos} minutos`);
    console.log(`  - Nota mínima: ${testData.notaMinima}%`);

    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
  } catch (error) {
    console.error('✗ Error al cargar el test:', error.message);
    process.exit(1);
  }
};

cargarTestTema4();
