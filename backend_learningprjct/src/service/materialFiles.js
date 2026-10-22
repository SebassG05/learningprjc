// Archivos del curso servidos por el backend (materiales, actividades y PDFs de entregas).
// El navegador nunca recibe una URL de Cloudinary reutilizable de un curso privado: pide el archivo al
// backend con su token, el backend comprueba el acceso y lo descarga de Cloudinary por él.
//   - Materiales en type 'upload' (públicos en Cloudinary): se piden por su URL guardada.
//   - Materiales en type 'authenticated': se piden con una URL de descarga firmada que caduca en 60 s.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import cloudinary from '../config/cloudinary.js';

// Sustituible en los tests (no salen a la red)
export const deps = { fetch: (...args) => globalThis.fetch(...args) };

const SIGNED_URL_TTL_SECONDS = 60;
const CLOUDINARY_HOST = 'res.cloudinary.com';

const parseUrl = (value) => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

// Solo https://res.cloudinary.com/<nuestra cuenta>/… (comparando host exacto, no subcadenas)
export function isOwnCloudinaryUrl(value) {
  const url = parseUrl(value);
  const cloud = cloudinary.config().cloud_name;
  return Boolean(url && cloud && url.protocol === 'https:' && url.hostname === CLOUDINARY_HOST
    && url.pathname.startsWith(`/${cloud}/`));
}

// https://res.cloudinary.com/<cloud>/raw/<upload|authenticated>/[s--firma--/][v123/]<public_id>
const RAW_PATH = /^\/[^/]+\/raw\/(upload|authenticated)\/(?:s--[\w-]+--\/)?(?:v\d+\/)?(.+)$/;

export function cloudinaryRawAsset(value) {
  const url = parseUrl(value);
  const match = url && RAW_PATH.exec(url.pathname);
  return match ? { type: match[1], publicId: decodeURIComponent(match[2]) } : null;
}

// URL desde la que el backend descarga el archivo
export function upstreamUrl(storedUrl) {
  const asset = cloudinaryRawAsset(storedUrl);
  if (asset?.type !== 'authenticated') return storedUrl;
  return cloudinary.utils.private_download_url(asset.publicId, '', {
    resource_type: 'raw',
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS,
  });
}

// Busca un material o actividad optativa por id en cualquier tema
export function findCourseFile(course, fileId) {
  for (const tema of course.temas ?? []) {
    for (const list of [tema.materiales, tema.actividadesOptativas]) {
      const found = (list ?? []).find((m) => String(m._id) === String(fileId));
      if (found) return found;
    }
  }
  return null;
}

const privateHeaders = (res, filename, contentType) => {
  res.set('Cache-Control', 'private, no-store');
  res.vary('Authorization');
  res.set('Content-Type', contentType);
  // filename* (RFC 5987) admite tildes; el nombre ASCII es el respaldo
  const ascii = filename.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, '');
  res.set('Content-Disposition', `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
};

// Descarga de Cloudinary y reenvía al cliente. Si Cloudinary falla, 502 sin detalles.
export async function pipeFromCloudinary(res, storedUrl, filename = path.basename(new URL(storedUrl).pathname)) {
  const upstream = await deps.fetch(upstreamUrl(storedUrl));
  if (!upstream.ok || !upstream.body) {
    console.error(`Cloudinary respondió ${upstream.status} al pedir un archivo del curso`);
    return res.status(502).json({ error: 'No se pudo obtener el archivo' });
  }
  // Cloudinary sirve los raw como octet-stream: un .pdf se manda como PDF para que se vea en línea
  const type = /\.pdf$/i.test(filename) ? 'application/pdf' : upstream.headers.get('content-type') || 'application/octet-stream';
  privateHeaders(res, filename, type);
  Readable.fromWeb(upstream.body).pipe(res);
}

// ============= PDFs de entregas (disco local) =============

// La misma carpeta en la que entregaEjercicioController guarda los PDFs
export const SUBMISSIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../public/ejercicios');

// Ruta en disco del PDF de una entrega, o null si la url guardada no apunta dentro de la carpeta
export function submissionFilePath(entrega) {
  const url = entrega?.archivoPdf?.url;
  if (typeof url !== 'string' || !url.startsWith('/ejercicios/')) return null;
  const name = url.slice('/ejercicios/'.length);
  if (!name || name !== path.basename(name)) return null; // nada de ../ ni subcarpetas
  return path.join(SUBMISSIONS_DIR, name);
}

export function sendSubmissionFile(res, entrega, filePath) {
  privateHeaders(res, entrega.archivoPdf?.nombreOriginal || path.basename(filePath), 'application/pdf');
  return res.sendFile(filePath);
}
