// Asigna un área del catálogo (src/config/courseCatalog.js) a los cursos que no la tienen,
// deducida de sus etiquetas (`category`) y su título.
//
//   node scripts/asignarAreas.js --dry-run   → solo enseña qué asignaría (por defecto; no escribe nada)
//   node scripts/asignarAreas.js --apply     → escribe (pide escribir «SI» antes de tocar la base de datos)
//   --force                                   → también recalcula los cursos que ya tienen área
//
// Usa MONGODB_URI del .env: comprueba a qué base apunta (se imprime al empezar) antes de usar --apply.
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import Course from '../src/models/Course.js';
import { COURSE_AREAS } from '../src/config/courseCatalog.js';

dotenv.config();

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const FORCE = args.has('--force');
if (APPLY && args.has('--dry-run')) {
  console.error('Usa --dry-run o --apply, no los dos.');
  process.exit(1);
}

// Palabras clave por área (sin tildes, en minúsculas). Revisar al añadir áreas nuevas.
const KEYWORDS = {
  'desarrollo-datos': ['react', 'node', 'nodejs', 'vscode', 'ia', 'ai', 'datos', 'data', 'web', 'javascript', 'python', 'programacion', 'software', 'desarrollo', 'aplicaciones'],
  sostenibilidad: ['agua', 'water', 'hidrica', 'footprint', 'soilwater', 'suelo', 'soil', 'carbono', 'carbon', 'clima', 'climatico', 'sostenible', 'sostenibilidad', 'agricultura', 'huella', 'modelizacion', 'ambiental'],
};

const normalize = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const words = (s) => new Set(normalize(s).split(/[^a-z0-9]+/).filter(Boolean));

// Devuelve { area, motivo } o { area: null, motivo } si no hay un ganador claro
export function suggestArea(course) {
  const bag = new Set([...words(course.title), ...words(course.titleEn), ...(course.category || []).flatMap((c) => [...words(c)])]);
  const scores = Object.entries(KEYWORDS).map(([slug, keys]) => ({ slug, hits: keys.filter((k) => bag.has(k)) }));
  scores.sort((a, b) => b.hits.length - a.hits.length);
  const [best, second] = scores;
  if (!best.hits.length) return { area: null, motivo: 'ninguna palabra clave' };
  if (second && second.hits.length === best.hits.length) {
    return { area: null, motivo: `empate (${best.slug}: ${best.hits.join(', ')} / ${second.slug}: ${second.hits.join(', ')})` };
  }
  return { area: best.slug, motivo: best.hits.join(', ') };
}

const label = (slug) => COURSE_AREAS.find((a) => a.slug === slug)?.label ?? slug;

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/learningprjct';
  const host = uri.replace(/\/\/[^@]*@/, '//***@').split('?')[0];
  console.log(`Base de datos: ${host}`);
  console.log(`Modo: ${APPLY ? 'APLICAR (escribe)' : 'DRY-RUN (solo lectura)'}${FORCE ? ' · --force' : ''}\n`);

  await mongoose.connect(uri);
  const courses = await Course.find({}, { title: 1, titleEn: 1, category: 1, area: 1 }).lean();

  const plan = [];
  for (const c of courses) {
    const name = c.title || c.titleEn;
    if (c.area && !FORCE) {
      console.log(`= ${name}\n    ya tiene área: ${label(c.area)} (se deja igual)`);
      continue;
    }
    const { area, motivo } = suggestArea(c);
    if (!area) {
      console.log(`? ${name}\n    sin asignar, revisar a mano: ${motivo}`);
      continue;
    }
    console.log(`→ ${name}\n    ${label(area)}  (por: ${motivo})${c.area ? `  · antes: ${label(c.area)}` : ''}`);
    plan.push({ _id: c._id, area, antes: c.area ?? null });
  }

  console.log(`\n${plan.length} curso(s) cambiarían de ${courses.length}.`);
  if (!APPLY || plan.length === 0) {
    if (!APPLY) console.log('Dry-run: no se ha escrito nada. Para aplicar: --apply');
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`Escribe «SI» para guardar ${plan.length} cambio(s) en ${host}: `);
  rl.close();
  if (answer.trim() !== 'SI') {
    console.log('Cancelado. No se ha escrito nada.');
    return;
  }
  for (const p of plan) await Course.updateOne({ _id: p._id }, { $set: { area: p.area } });
  // Reversión: lo anterior queda impreso para poder deshacerlo a mano
  console.log('Hecho. Para revertir, estos eran los valores anteriores:');
  console.log(JSON.stringify(plan.map(({ _id, antes }) => ({ _id, area: antes })), null, 2));
}

// Solo se ejecuta como script (los tests importan suggestArea)
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:')}`) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}
