// Helpers puros de las dudas (sin React ni DOM): fechas relativas, contadores y agrupaciones.

const MIN = 60 * 1000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;

export function tiempoRelativo(date, lang = 'es', now = new Date()) {
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Math.max(0, new Date(now).getTime() - t);
  const en = lang === 'en';
  if (diff < MIN) return en ? 'just now' : 'hace un momento';
  if (diff < HORA) {
    const n = Math.floor(diff / MIN);
    return en ? `${n} min ago` : `hace ${n} min`;
  }
  if (diff < DIA) {
    const n = Math.floor(diff / HORA);
    return en ? `${n} h ago` : `hace ${n} h`;
  }
  const n = Math.floor(diff / DIA);
  if (en) return n === 1 ? '1 day ago' : `${n} days ago`;
  return n === 1 ? 'hace 1 día' : `hace ${n} días`;
}

// Dudas propias con una respuesta que el autor aún no ha visto
export const contarNuevas = (dudas) => (dudas ?? []).filter((d) => d.mine && d.respuestaNoVista).length;

// Agrupa por curso conservando el orden de llegada
export function agruparPorCurso(dudas) {
  const grupos = new Map();
  for (const d of dudas ?? []) {
    const id = d.curso?._id ?? d.cursoId;
    if (!grupos.has(id)) grupos.set(id, { curso: d.curso, dudas: [] });
    grupos.get(id).dudas.push(d);
  }
  return [...grupos.values()];
}

export function temaLabel(temaId, temas, lang = 'es') {
  if (temaId === 'general') return 'General';
  const tema = (temas ?? []).find((t) => String(t._id) === String(temaId));
  if (!tema) return 'Tema';
  const titulo = lang === 'en' ? tema.tituloEn || tema.titulo : tema.titulo || tema.tituloEn;
  return titulo ? `Tema ${tema.numeroTema} · ${titulo}` : `Tema ${tema.numeroTema}`;
}
