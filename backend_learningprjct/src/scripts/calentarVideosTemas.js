// Genera de antemano en Cloudinary las versiones de los vídeos de los temas (f_auto da VP9 a Chrome/Firefox
// y H.264 a Safari/iOS, en 720p y en original) y sus pósters. Sin esto, el primer alumno de cada navegador
// espera a que se generen (minutos en iOS) y el reproductor recibe una duración provisional.
// Solo LEE la base de datos y pide a Cloudinary los primeros bytes de cada URL (firmadas si el vídeo es
// «authenticated»). Ejecutarlo tras actualizarTemasCarbono.js y tras moverMaterialesAAuthenticated.js.
//
//   node src/scripts/calentarVideosTemas.js [--course=<id>]
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import { CARBONO_COURSE_ID } from '../config/carbonoTemas.js';
import { temaVideoUrls } from '../service/courseVideoService.js';

dotenv.config();

const courseId = process.argv.find((a) => a.startsWith('--course='))?.slice('--course='.length) ?? CARBONO_COURSE_ID;
const AGENTS = {
  chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  safari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
};
const TIMEOUT_MS = 10 * 60 * 1000; // la primera generación de un vídeo largo puede tardar minutos

async function warm(url, agent) {
  const started = Date.now();
  try {
    const res = await fetch(url, { headers: { 'User-Agent': agent, Range: 'bytes=0-1023' }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    await res.body?.cancel();
    return `${res.status} ${res.headers.get('content-type') ?? ''} ${((Date.now() - started) / 1000).toFixed(1)} s`;
  } catch (err) {
    return `ERROR ${err.message}`;
  }
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const course = await Course.findById(courseId).select('title temas.numeroTema temas.video').lean();
  if (!course) throw new Error(`El curso ${courseId} no existe`);
  console.log(`Curso: ${course.title}\n`);
  let failed = 0;
  for (const tema of course.temas.filter((t) => t.video?.publicId)) {
    const urls = temaVideoUrls(tema.video);
    const jobs = [
      ...['sd', 'hd'].flatMap((q) => Object.entries(AGENTS).map(([name, agent]) => [`${q} · ${name}`, urls[q], agent])),
      ...urls.posters.map((p) => [`póster ${p.width}`, p.url, AGENTS.chrome]),
    ];
    for (const [label, url, agent] of jobs) {
      const result = await warm(url, agent);
      if (!/^20[06]/.test(result)) failed += 1;
      console.log(`Tema ${tema.numeroTema} · ${tema.video.publicId} · ${label}: ${result}`);
    }
  }
  await mongoose.connection.close();
  console.log(failed ? `\n${failed} URLs con error: repite el script.` : '\nTodo generado.');
  process.exit(failed ? 1 : 0);
} catch (err) {
  console.error('Error:', err.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
}
