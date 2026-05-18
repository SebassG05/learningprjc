import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Test from '../models/Test.js';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const cargarTestAnforaTema4 = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    const curso = await Course.findOne({ title: 'ANFORA: Gestión de la Huella Hídrica' });
    if (!curso) {
      console.error('✗ ERROR: Curso "ANFORA: Gestión de la Huella Hídrica" no encontrado en la BD.');
      process.exit(1);
    }
    console.log(`✓ Curso encontrado: "${curso.title}" (ID: ${curso._id})`);

    const tema4 = curso.temas?.find(t => t.numeroTema === 4);
    if (!tema4) {
      console.error('✗ ERROR: No se encontró el Tema 4 en el curso.');
      console.error('   Temas disponibles:', curso.temas?.map(t => `Tema ${t.numeroTema}: ${t.titulo}`));
      process.exit(1);
    }
    console.log(`✓ Tema 4 encontrado: "${tema4.titulo}" (ID: ${tema4._id})`);

    const testData = JSON.parse(
      readFileSync(join(__dirname, '../data/test-anfora-tema4.json'), 'utf-8')
    );

    testData.cursoId = curso._id.toString();
    testData.temaId  = tema4._id.toString();

    const testExistente = await Test.findOne({ temaId: testData.temaId });

    if (testExistente) {
      console.log('⚠️  Ya existe un test para este tema. Actualizando...');
      await Test.findByIdAndUpdate(testExistente._id, testData);
      console.log('✓ Test actualizado correctamente');
    } else {
      const nuevoTest = new Test(testData);
      await nuevoTest.save();
      console.log('✓ Test creado correctamente');
    }

    console.log('\nTest cargado con éxito:');
    console.log(`  - Curso ID  : ${testData.cursoId}`);
    console.log(`  - Tema ID   : ${testData.temaId}`);
    console.log(`  - Título ES : ${testData.titulo}`);
    console.log(`  - Título EN : ${testData.tituloEn}`);
    console.log(`  - Preguntas : ${testData.preguntas.length}`);
    console.log(`  - Duración  : ${testData.duracionMinutos} minutos`);
    console.log(`  - Nota mín. : ${testData.notaMinima}%`);

  } catch (error) {
    console.error('✗ Error al cargar el test:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
    process.exit(0);
  }
};

cargarTestAnforaTema4();
