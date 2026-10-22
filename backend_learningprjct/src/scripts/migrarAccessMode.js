// Marca como 'public' todos los cursos que aún no tienen accessMode (comportamiento de siempre).
// Simulacro por defecto; escribe solo con --apply. Idempotente: repetirlo no cambia nada.
//
//   node src/scripts/migrarAccessMode.js            → cuántos cursos se migrarían
//   node src/scripts/migrarAccessMode.js --apply    → los migra
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { migrateAccessMode } from '../service/cohortMigrations.js';

dotenv.config();

const apply = process.argv.includes('--apply');
const host = (uri) => (uri ? uri.replace(/\/\/[^@]+@/, '//***@').split('?')[0] : '(sin MONGODB_URI)');

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Base de datos: ${host(process.env.MONGODB_URI)}`);
  console.log(apply ? 'Modo: APLICAR\n' : 'Modo: simulacro (añade --apply para escribir)\n');

  const { pending, updated } = await migrateAccessMode({ apply });
  console.log(`Cursos sin accessMode: ${pending}`);
  console.log(apply ? `Actualizados a 'public': ${updated}` : 'No se ha escrito nada.');
  await mongoose.connection.close();
  process.exit(0);
} catch (err) {
  console.error('Error:', err.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
}
