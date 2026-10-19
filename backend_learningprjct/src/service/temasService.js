// Orden y numeración de los temas de un curso. Los tests y el progreso se enlazan por el _id del
// tema, así que reordenar o renumerar solo cambia el «Tema N» que ven los alumnos.

export class TemasError extends Error {
  constructor(mensaje, status = 400) {
    super(mensaje);
    this.status = status;
  }
}

// Siguiente número libre (no «cantidad + 1»: tras borrar un tema ese número podía estar ocupado)
export const siguienteNumero = (temas = []) => temas.reduce((max, t) => Math.max(max, Number(t.numeroTema) || 0), 0) + 1;

// Numeración continua 1..N en el orden actual del array
export function renumerar(temas) {
  temas.forEach((t, i) => {
    t.numeroTema = i + 1;
    t.orden = i + 1;
  });
  return temas;
}

/**
 * Reordena los temas según `ids` (debe ser una permutación exacta de los temas del curso)
 * y los renumera. Devuelve el nuevo array de subdocumentos (mismos objetos, otro orden).
 */
export function reordenar(temas = [], ids) {
  if (!Array.isArray(ids) || ids.length !== temas.length) {
    throw new TemasError('La lista de temas no coincide con los del curso');
  }
  const porId = new Map(temas.map((t) => [String(t._id), t]));
  const vistos = new Set();
  const nuevo = ids.map((id) => {
    const t = porId.get(String(id));
    if (!t || vistos.has(String(id))) throw new TemasError('La lista de temas no coincide con los del curso');
    vistos.add(String(id));
    return t;
  });
  return renumerar(nuevo);
}

const CAMPOS_TEMA = ['titulo', 'tituloEn', 'descripcion', 'descripcionEn'];

/**
 * Edita los textos de un tema. Un campo ausente no se toca; una cadena vacía lo borra.
 * Siempre debe quedar al menos un título (es o en).
 */
export function editarTema(tema, body = {}) {
  const cambios = {};
  CAMPOS_TEMA.forEach((k) => {
    if (body[k] === undefined) return;
    if (typeof body[k] !== 'string') throw new TemasError(`«${k}» debe ser texto`);
    cambios[k] = body[k].trim();
  });
  const titulo = cambios.titulo ?? tema.titulo ?? '';
  const tituloEn = cambios.tituloEn ?? tema.tituloEn ?? '';
  if (!titulo.trim() && !tituloEn.trim()) throw new TemasError('El tema necesita un título en español o en inglés');
  Object.entries(cambios).forEach(([k, v]) => {
    tema[k] = v || undefined;
  });
  return tema;
}
