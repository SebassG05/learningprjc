// PDF del temario de un tema: lo sirve la pasarela del backend (comprueba la cohorte) y se muestra o
// descarga desde una URL blob: local, porque un <iframe> o un <a> no pueden mandar el token.
import { API_URL, ApiError } from '../../../lib/coursesApi';
import { authFetch, loadCourseFile } from '../../../lib/courseFiles';

export const temarioFilename = (numero, titulo) =>
  `Tema ${numero} - ${titulo}`.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim() + '.pdf';

// Ruta de la pestaña que abre el PDF con el visor nativo (táctil)
export const temarioRoute = (cursoId, materialId, lang = 'es') => `/curso/${cursoId}/temario/${materialId}${lang === 'en' ? '?lang=en' : ''}`;

/**
 * Enlace de corta duración (60 s) al PDF servido por el backend: la pestaña navega a una URL https real y el
 * sistema abre su visor (iOS, Android, escritorio) sin depender de URLs blob: entre pestañas.
 */
export async function temarioLink(cursoId, materialId, signal, lang = 'es') {
  const res = await authFetch(`${API_URL}/api/courses/${cursoId}/materiales/${materialId}/enlace`, { method: 'POST', signal });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(body?.error || `HTTP ${res.status}`, res.status, body);
  return `${API_URL}${body.path}${lang === 'en' ? '&lang=en' : ''}`;
}

/** → { url } (blob:, revócala al terminar) o { external } */
export const loadTemario = (cursoId, materialId, signal, lang = 'es') => loadCourseFile(cursoId, materialId, lang, signal);

// Descarga con nombre legible. Revoca la URL un poco después: Safari la necesita viva al iniciar la descarga
export async function downloadTemario(cursoId, materialId, filename, lang = 'es') {
  const { url, external } = await loadTemario(cursoId, materialId, undefined, lang);
  if (external) {
    window.open(external, '_blank', 'noopener');
    return;
  }
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
