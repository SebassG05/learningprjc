// Pasa los PDFs del curso de Carbono (materiales y actividades, ES/EN) de Cloudinary «upload» (URL pública)
// a «authenticated»: las URLs antiguas dejan de funcionar y el contenido solo se sirve a través del
// backend, que comprueba la cohorte. Guarda en el curso las URLs nuevas.
//
//   node src/scripts/moverMaterialesAAuthenticated.js            → simulacro: lista lo que movería
//   node src/scripts/moverMaterialesAAuthenticated.js --apply    → upload → authenticated (+ invalida la CDN)
//   node src/scripts/moverMaterialesAAuthenticated.js --revert   → authenticated → upload
//   … --course=<id>  para otro curso
//
// SOLO después de desplegar el backend con la pasarela GET /api/courses/:id/materiales/:materialId y el
// front que la usa: antes, el aula seguiría pidiendo las URLs públicas y dejaría de ver los PDFs.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { migrateCourseMaterials } from '../service/materialsMigration.js';

dotenv.config();

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const revert = args.includes('--revert');
const courseId = args.find((a) => a.startsWith('--course='))?.slice('--course='.length) ?? '69d50406663e8648d7ee1f08';
if (apply && revert) {
  console.error('Usa --apply o --revert, no los dos.');
  process.exit(1);
}
const to = revert ? 'upload' : 'authenticated';
const write = apply || revert;
const host = (uri) => (uri ? uri.replace(/\/\/[^@]+@/, '//***@').split('?')[0] : '(sin MONGODB_URI)');
const ICON = { pending: '→', done: '✓', skipped: '–', error: '✗' };

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Base de datos: ${host(process.env.MONGODB_URI)} · Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`${write ? 'APLICANDO' : 'SIMULACRO'}: → «${to}»\n`);

  const r = await migrateCourseMaterials({ courseId, to, apply: write });
  console.log(`Curso: ${r.course.title} (${r.course._id})`);
  for (const f of r.files) {
    console.log(`${ICON[f.status]} Tema ${f.tema} · ${f.titulo || '(sin título)'} · ${f.field}: ${f.publicId}${f.error ? `  — ${f.error}` : ''}`);
  }
  const count = (s) => r.files.filter((f) => f.status === s).length;
  console.log(`\n${r.files.length} archivos · ${count('done')} movidos · ${count('pending')} pendientes · ${count('skipped')} ya estaban · ${count('error')} con error`);
  if (!write) console.log('No se ha cambiado nada. Repite con --apply para mover.');
  await mongoose.connection.close();
  process.exit(count('error') ? 1 : 0);
} catch (err) {
  console.error('Error:', err.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
}
