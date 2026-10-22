// Contenido del aula que exige sesión: peticiones con el token y archivos servidos por el backend.
// Un <iframe> o un <a href> no pueden mandar el token, así que los PDFs se descargan con fetch y se
// muestran desde una URL blob: local (quien la usa la libera con URL.revokeObjectURL).
import { API_URL, ApiError, readToken } from './coursesApi';

export const authHeaders = () => {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// fetch con la sesión (si la hay)
export const authFetch = (url, init = {}) => fetch(url, { ...init, headers: { ...authHeaders(), ...init.headers } });

// ¿Es un archivo «raw» de Cloudinary (PDF de material)? Esos los sirve la pasarela del backend.
export const isCloudinaryRaw = (url) => typeof url === 'string' && /^https:\/\/res\.cloudinary\.com\/[^/]+\/raw\//.test(url);

async function blobUrlFrom(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error || `HTTP ${res.status}`, res.status, body);
  }
  if ((res.headers.get('content-type') || '').includes('application/json')) {
    // Enlace externo: la pasarela devuelve su URL en vez del archivo
    return { external: (await res.json()).url };
  }
  return { url: URL.createObjectURL(await res.blob()) };
}

/** Material o actividad de un tema → { url } (blob:, revócala al terminar) o { external } */
export async function loadCourseFile(courseId, fileId, lang = 'es', signal) {
  const res = await authFetch(`${API_URL}/api/courses/${courseId}/materiales/${fileId}?lang=${lang}`, { signal });
  return blobUrlFrom(res);
}

/** PDF de una entrega (su autor o un admin) → { url } */
export async function loadSubmissionFile(entregaId, signal) {
  const res = await authFetch(`${API_URL}/api/entregas/${entregaId}/archivo`, { signal });
  return blobUrlFrom(res);
}
