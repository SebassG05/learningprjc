// Cohorte «Carbono – Noviembre 2026» del curso Modelización Dinámica de Carbono y paso del curso a privado.
// Simulacro por defecto; escribe solo con --apply. Idempotente: si la cohorte ya existe (mismo nombre),
// actualiza fechas y añade los emails nuevos sin duplicar.
//
//   node src/scripts/crearCohorteCarbono.js
//   node src/scripts/crearCohorteCarbono.js --apply
//   node src/scripts/crearCohorteCarbono.js --apply --starts=2026-11-30T09:00 --ends=2027-03-31T23:59 --emails=lista.txt
//   node src/scripts/crearCohorteCarbono.js --rollback [--apply]   → el curso vuelve a público (la cohorte se conserva)
//
// Fechas en hora de Madrid. Las de por defecto son PROVISIONALES (aún no hay fechas exactas): el inicio
// tardío es el lado seguro (hasta entonces los miembros ven «Plaza reservada»). Se cambian desde
// Panel → Accesos o volviendo a ejecutar con --starts/--ends.
import fs from 'node:fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { rollbackCourseCohort, setupCourseCohort } from '../service/cohortMigrations.js';

dotenv.config();

const COURSE_ID = '69d50406663e8648d7ee1f08';
const COHORT_NAME = 'Carbono – Noviembre 2026';
const DEFAULT_STARTS = '2026-11-30T00:00';
const DEFAULT_ENDS = '2027-03-31T23:59';

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const apply = process.argv.includes('--apply');
const rollback = process.argv.includes('--rollback');
const host = (uri) => (uri ? uri.replace(/\/\/[^@]+@/, '//***@').split('?')[0] : '(sin MONGODB_URI)');

// «2026-11-30T09:00» en hora peninsular española (CET +01:00 en invierno, CEST +02:00 en verano)
function madrid(local) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) throw new Error(`Fecha con formato AAAA-MM-DDTHH:mm: ${local}`);
  for (const offset of ['+01:00', '+02:00']) {
    const date = new Date(`${local}:00${offset}`);
    const shown = date.toLocaleString('sv-SE', { timeZone: 'Europe/Madrid' }).slice(0, 16).replace(' ', 'T');
    if (shown === local) return date;
  }
  throw new Error(`Hora inexistente en Madrid (cambio de hora): ${local}`);
}

const fmt = (d) => d.toLocaleString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'long', timeStyle: 'short' });

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Base de datos: ${host(process.env.MONGODB_URI)}`);
  console.log(apply ? 'Modo: APLICAR\n' : 'Modo: simulacro (añade --apply para escribir)\n');

  if (rollback) {
    const r = await rollbackCourseCohort({ courseId: COURSE_ID, apply });
    console.log(`Curso: ${r.course.title} (${r.course._id})`);
    console.log(`accessMode: ${r.accessMode.from} → ${r.accessMode.to}`);
    console.log('Las cohortes se conservan; con el curso público no limitan el acceso.');
  } else {
    const emailsFile = arg('emails');
    const r = await setupCourseCohort({
      courseId: COURSE_ID,
      name: COHORT_NAME,
      startsAt: madrid(arg('starts') ?? DEFAULT_STARTS),
      endsAt: madrid(arg('ends') ?? DEFAULT_ENDS),
      afterEnd: 'readonly',
      emails: emailsFile ? fs.readFileSync(emailsFile, 'utf8') : '',
      apply,
    });
    console.log(`Curso: ${r.course.title} (${r.course._id})`);
    console.log(`Cohorte: ${r.cohort.action === 'create' ? 'se crea' : 'ya existe, se actualiza'} «${r.cohort.name}»${r.cohort._id ? ` (${r.cohort._id})` : ''}`);
    console.log(`  Empieza: ${fmt(r.cohort.startsAt)}${arg('starts') ? '' : '  (PROVISIONAL)'}`);
    console.log(`  Termina: ${fmt(r.cohort.endsAt)}${arg('ends') ? '' : '  (PROVISIONAL)'}`);
    console.log('  Al terminar: solo lectura');
    console.log(`accessMode: ${r.accessMode.from} → ${r.accessMode.to}`);
    if (emailsFile) {
      console.log(`Miembros: ${r.members.added.length} añadidos (pendientes), ${r.members.existing.length} ya estaban, ${r.members.invalid.length} inválidos`);
      if (r.members.invalid.length) console.log(`  Inválidos: ${r.members.invalid.join(', ')}`);
    }
    if (r.enrollmentsWithoutCohort.length) {
      console.log(`\nInscripciones sin cohorte (perderán el acceso al contenido; no se tocan): ${r.enrollmentsWithoutCohort.length}`);
      r.enrollmentsWithoutCohort.forEach((e) => console.log(`  - ${e}`));
    } else {
      console.log('\nNo hay inscripciones fuera de la cohorte.');
    }
  }
  if (!apply) console.log('\nNo se ha escrito nada.');
  await mongoose.connection.close();
  process.exit(0);
} catch (err) {
  console.error('Error:', err.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
}
