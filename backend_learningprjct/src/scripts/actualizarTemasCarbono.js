// Pone el temario nuevo (octubre 2026) en los 4 temas del curso de Carbono: título, descripción, índice,
// conceptos clave, vídeo y PDF (config/carbonoTemas.js). Idempotente: se puede repetir sin efectos.
//
//   node src/scripts/actualizarTemasCarbono.js            → simulacro: solo lee y lista los cambios
//   node src/scripts/actualizarTemasCarbono.js --apply    → los guarda
//
// Los PDFs y vídeos quedan en «upload» (públicos); a continuación hay que pasarlos a «authenticated» con
// moverMaterialesAAuthenticated.js --apply. OJO: el .env local apunta a la base de datos de PRODUCCIÓN.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CARBONO_COURSE_ID, CARBONO_TEMAS } from '../config/carbonoTemas.js';
import { applyTemasContent } from '../service/temasContent.js';

dotenv.config();

const apply = process.argv.includes('--apply');
const host = (uri) => (uri ? uri.replace(/\/\/[^@]+@/, '//***@').split('?')[0] : '(sin MONGODB_URI)');
const show = (v) => {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s && s.length > 90 ? `${s.slice(0, 87)}…` : s;
};

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Base de datos: ${host(process.env.MONGODB_URI)}`);
  console.log(`${apply ? 'APLICANDO' : 'SIMULACRO'}\n`);

  const r = await applyTemasContent({ courseId: CARBONO_COURSE_ID, temas: CARBONO_TEMAS, apply });
  console.log(`Curso: ${r.course.title} (${r.course._id})`);
  for (const c of r.changes) console.log(`→ Tema ${c.tema} · ${c.field}: ${show(c.from) ?? '(vacío)'}\n    ⇒ ${show(c.to)}`);
  for (const n of r.missing) console.log(`✗ El tema ${n} no existe en el curso: no se crea, revísalo.`);
  for (const w of r.warnings) console.log(`⚠ ${w}`);
  console.log(`\n${r.changes.length} cambios${apply ? ' guardados' : ' pendientes'}.`);
  if (!apply && r.changes.length) console.log('No se ha cambiado nada. Repite con --apply para guardar.');
  await mongoose.connection.close();
  process.exit(r.missing.length ? 1 : 0);
} catch (err) {
  console.error('Error:', err.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
}
