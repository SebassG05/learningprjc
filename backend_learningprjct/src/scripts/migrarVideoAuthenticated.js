// Pasa los vídeos de config/courseVideos.js de «upload» (público) a «authenticated» (solo URLs firmadas).
// Mientras el asset sea público, quien tenga la URL de la preview puede quitarle la transformación y ver
// el vídeo completo; tras migrar, solo valen las URLs que firma el backend.
//
//   node src/scripts/migrarVideoAuthenticated.js            → dry-run: solo lee y explica qué haría
//   node src/scripts/migrarVideoAuthenticated.js --apply    → upload → authenticated (+ invalida la CDN)
//   node src/scripts/migrarVideoAuthenticated.js --revert   → authenticated → upload
//
// Orden de despliegue: 1) backend con este código y CLOUDINARY_VIDEO_TYPE=upload; 2) --apply;
// 3) CLOUDINARY_VIDEO_TYPE=authenticated y reiniciar. Si la versión cambia, actualizar courseVideos.js.
import cloudinary from '../config/cloudinary.js';
import { COURSE_VIDEOS } from '../config/courseVideos.js';

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const revert = args.has('--revert');
if (apply && revert) {
  console.error('Usa --apply o --revert, no los dos.');
  process.exit(1);
}
const [from, to] = revert ? ['authenticated', 'upload'] : ['upload', 'authenticated'];
const write = apply || revert;

const find = async (publicId, type) => {
  try {
    return await cloudinary.api.resource(publicId, { resource_type: 'video', type });
  } catch (err) {
    if (err.error?.http_code === 404) return null;
    throw err;
  }
};

console.log(`${write ? 'APLICANDO' : 'DRY-RUN'}: ${from} → ${to}\n`);
let failed = false;
for (const [courseId, { publicId, version }] of Object.entries(COURSE_VIDEOS)) {
  const [origen, destino] = await Promise.all([find(publicId, from), find(publicId, to)]);
  const tag = `${courseId} · ${publicId}`;
  if (!origen) {
    console.log(`– ${tag}: no existe como «${from}»${destino ? ` (ya es «${to}», v${destino.version})` : ''}. Nada que hacer.`);
    continue;
  }
  if (destino) {
    console.log(`✗ ${tag}: existe a la vez como «${from}» y «${to}». Revísalo a mano.`);
    failed = true;
    continue;
  }
  if (!write) {
    console.log(`→ ${tag}: se movería de «${from}» a «${to}» (v${origen.version}, ${(origen.bytes / 1e6).toFixed(1)} MB).`);
    continue;
  }
  const r = await cloudinary.uploader.rename(publicId, publicId, {
    resource_type: 'video',
    type: from,
    to_type: to,
    invalidate: true,
  });
  console.log(`✓ ${tag}: ahora es «${r.type}» (v${r.version}).`);
  if (r.version !== version) console.log(`  ⚠ La versión cambió: actualiza courseVideos.js a version: ${r.version}`);
}
console.log(write ? `\nHecho. Ajusta CLOUDINARY_VIDEO_TYPE=${to} y reinicia el backend.` : '\nNo se ha cambiado nada. Repite con --apply para migrar.');
process.exit(failed ? 1 : 0);
