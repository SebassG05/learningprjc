// API simulada para las pruebas de rendimiento y regresión visual. Solo lectura y determinista:
// mismos datos y misma latencia en cada ejecución, sin tocar el backend real ni producción.
//   MOCK_PORT (8549 por defecto)  MOCK_LATENCY en ms (300 por defecto)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.MOCK_PORT || 8549);
const LATENCY = Number(process.env.MOCK_LATENCY ?? 300);
const BASE = `http://localhost:${PORT}`;

const { COURSE_AREAS, COURSE_LEVELS } = await import(
  pathToFileURL(path.resolve(here, '../../../backend_learningprjct/src/config/courseCatalog.js')).href
);
const courses = JSON.parse(fs.readFileSync(path.join(here, 'courses.json'), 'utf8').replaceAll('__API__', BASE));

const REVIEW_TEXTS = [
  'Muy completo y bien explicado. Los ejercicios prácticos ayudan a fijar los conceptos del temario.',
  'Buen curso.',
  'El material técnico es excelente y los tests de cada módulo te obligan a repasar lo importante antes de seguir.',
  'Me sirvió para el trabajo desde la primera semana.',
  'Contenido actualizado y un ritmo cómodo para compaginarlo con el trabajo.',
];
const NAMES = ['Lucía Romero', 'Pablo Ortega', 'Marta Gil', 'Javier Núñez', 'Carmen Díaz'];
const reviews = REVIEW_TEXTS.map((description, i) => {
  const date = new Date(Date.UTC(2026, 8, 20 - i * 3, 10)).toISOString();
  return { _id: `r${i}`, name: NAMES[i], rating: [5, 4, 5, 4, 5][i], description, createdAt: date, updatedAt: date };
});

const terms = { version: '2026-10-16', title: 'Términos del curso', sections: [] };

const send = (res, status, body) => {
  setTimeout(() => {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    });
    res.end(JSON.stringify(body));
  }, LATENCY);
};

http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const img = p.match(/^\/fixtures\/img\/([\w-]+\.jpg)$/);
  if (img) {
    const file = path.join(here, 'img', img[1]);
    if (!fs.existsSync(file)) return send(res, 404, {});
    res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'max-age=3600' });
    return res.end(fs.readFileSync(file));
  }
  if (req.method !== 'GET') return send(res, 405, { error: 'mock de solo lectura' });
  if (p === '/api/reviews') return send(res, 200, reviews);
  if (p === '/api/courses/areas') return send(res, 200, { areas: COURSE_AREAS, niveles: COURSE_LEVELS });
  if (p === '/api/courses') return send(res, 200, courses);
  const one = p.match(/^\/api\/courses\/(\w+)$/);
  if (one) {
    const c = courses.find((x) => x._id === one[1]);
    return c ? send(res, 200, c) : send(res, 404, { error: 'Curso no encontrado' });
  }
  if (p === '/api/terms/current') return send(res, 200, terms);
  if (p === '/api/users/me') return send(res, 401, { error: 'Sin sesión' });
  return send(res, 404, { error: `mock: ${p}` });
}).listen(PORT, () => console.log(`mock API en ${BASE} (latencia ${LATENCY} ms)`));
