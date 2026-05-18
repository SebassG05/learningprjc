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

const cargarTestFinalAnfora = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    const curso = await Course.findOne({ title: 'ANFORA: Gestión de la Huella Hídrica' });
    if (!curso) {
      console.error('✗ ERROR: Curso "ANFORA: Gestión de la Huella Hídrica" no encontrado en la BD.');
      process.exit(1);
    }
    console.log(`✓ Curso encontrado: "${curso.title}" (ID: ${curso._id})`);

    const testData = JSON.parse(
      readFileSync(join(__dirname, '../data/test-anfora-final.json'), 'utf-8')
    );

    // El test final usa un temaId especial (string) que el sistema reconoce como certificación
    testData.cursoId = curso._id.toString();
    testData.temaId  = 'test-final-certificacion';

    const testExistente = await Test.findOne({
      cursoId: testData.cursoId,
      temaId: 'test-final-certificacion'
    });

    if (testExistente) {
      console.log('⚠️  Ya existe un test final para este curso. Actualizando...');
      await Test.findByIdAndUpdate(testExistente._id, testData);
      console.log('✓ Test final actualizado correctamente');
    } else {
      const nuevoTest = new Test(testData);
      await nuevoTest.save();
      console.log('✓ Test final creado correctamente');
    }

    console.log('\nTest Final cargado con éxito:');
    console.log(`  - Curso ID  : ${testData.cursoId}`);
    console.log(`  - Tema ID   : ${testData.temaId}`);
    console.log(`  - Título ES : ${testData.titulo}`);
    console.log(`  - Título EN : ${testData.tituloEn}`);
    console.log(`  - Preguntas : ${testData.preguntas.length}`);
    console.log(`  - Duración  : ${testData.duracionMinutos} minutos`);
    console.log(`  - Nota mín. : ${testData.notaMinima}%`);
    console.log('\n⭐ Este test es requisito para obtener el certificado del curso ANFORA');

  } catch (error) {
    console.error('✗ Error al cargar el test final:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada');
    process.exit(0);
  }
};

cargarTestFinalAnfora();
