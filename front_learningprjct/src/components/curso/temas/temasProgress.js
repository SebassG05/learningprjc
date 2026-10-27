// Lógica pura de las escenas de temas: etapas del ciclo, temas vistos, calidad del vídeo y formato.
// localStorage es solo una comodidad: si falla, nada se recuerda y todo sigue funcionando.
import { clearResume, readResume, saveResume } from '../../courses/sheet/videoResume.js';

// El ciclo del carbono como hilo del curso: suelo → dinámica → modelos → práctica.
// Acentos de la paleta del campus (todos ≥ 7:1 sobre canvas).
export const CICLO = [
  { key: 'suelo', es: 'Suelo', en: 'Soil', accent: '#f6d7a7' },
  { key: 'dinamica', es: 'Dinámica', en: 'Dynamics', accent: '#a1db87' },
  { key: 'modelos', es: 'Modelos', en: 'Models', accent: '#8fd3c8' },
  { key: 'practica', es: 'Práctica', en: 'Practice', accent: '#c9ecb7' },
];

export const etapa = (index) => CICLO[Math.min(Math.max(index, 0), CICLO.length - 1)];

// Las etapas con nombre (suelo → práctica) solo tienen sentido en Carbono. En el resto de cursos las escenas
// alternan los mismos acentos, sin nombre de etapa.
// Título a mostrar: sin el prefijo «Tema 01:» que traen algunos cursos (el número ya está en la escena)
export const tituloTema = (tema, idioma = 'es') => {
  const t = (idioma === 'en' && tema?.tituloEn) || tema?.titulo || '';
  return t.replace(/^\s*(tema|topic|unit|unidad|m[oó]dulo|module)\s*\d+\s*[:.\-–—]\s*/i, '') || t;
};
export const CURSO_CICLO = '69d50406663e8648d7ee1f08';
export const usaCiclo = (cursoId) => cursoId === CURSO_CICLO;
export const etapaDe = (index, ciclo) => {
  if (ciclo) return etapa(index);
  const e = CICLO[((index % CICLO.length) + CICLO.length) % CICLO.length];
  return { ...e, es: null, en: null };
};

// ¿Se pinta el curso como escenas? Solo si sus temas traen el temario nuevo (vídeo o índice)
export const tieneEscenas = (temas) => Array.isArray(temas) && temas.some((t) => t.video || t.apartados?.length);

// ---- Posición de reproducción por tema (reutiliza el almacén del vídeo de la ficha) ----
const resumeId = (cursoId, temaId) => `${cursoId}_${temaId}`;
export const readTemaResume = (cursoId, temaId, duration) => readResume(resumeId(cursoId, temaId), duration);
export const saveTemaResume = (cursoId, temaId, seconds) => saveResume(resumeId(cursoId, temaId), seconds);
export const clearTemaResume = (cursoId, temaId) => clearResume(resumeId(cursoId, temaId));

// ---- Temas vistos ----
export const SEEN_RATIO = 0.9; // con el 90 % reproducido el vídeo cuenta como visto
export const seenKey = (cursoId) => `temas_vistos_v1_${cursoId}`;

export function readSeen(cursoId) {
  try {
    const list = JSON.parse(localStorage.getItem(seenKey(cursoId)) ?? '[]');
    return new Set(Array.isArray(list) ? list.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function markSeen(cursoId, temaId) {
  const seen = readSeen(cursoId);
  seen.add(String(temaId));
  try {
    localStorage.setItem(seenKey(cursoId), JSON.stringify([...seen]));
  } catch {
    /* sin almacenamiento: solo dura esta visita */
  }
  return seen;
}

export const reachedSeen = (time, duration) =>
  Number.isFinite(time) && Number.isFinite(duration) && duration > 0 && time / duration >= SEEN_RATIO;

// ---- Calidad: 720p en pantallas pequeñas, ahorro de datos o conexión lenta; si no, la original ----
const SLOW = new Set(['slow-2g', '2g', '3g']);
export const SD_MAX_WIDTH = 900;

export function pickQuality({ width, saveData = false, effectiveType } = {}) {
  if (saveData || SLOW.has(effectiveType)) return 'sd';
  return Number.isFinite(width) && width <= SD_MAX_WIDTH ? 'sd' : 'hd';
}

export function currentQuality() {
  if (typeof window === 'undefined') return 'hd';
  const conn = navigator.connection;
  return pickQuality({ width: window.innerWidth, saveData: conn?.saveData, effectiveType: conn?.effectiveType });
}

// ---- Reproductor ----
export const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

export const formatSpeed = (rate) => `${String(rate).replace('.', ',')}×`;

// ---- Índice: numeración continua entre partes, como en el PDF ----
export function numerarApartados(apartados = []) {
  let n = 0;
  return apartados.map((a) => ({ ...a, items: (a.items ?? []).map((titulo) => ({ n: ++n, titulo })) }));
}

export const totalApartados = (apartados = []) => apartados.reduce((sum, a) => sum + (a.items?.length ?? 0), 0);

// ¿Abrir el PDF en una pestaña (móvil y tableta táctil) o en el visor del aula? Los visores embebidos
// fallan en iOS (solo la primera página, sin zoom): en táctil se abre la pestaña nativa.
export const prefersNativePdf = ({ coarse, hoverNone }) => Boolean(coarse && hoverNone);
