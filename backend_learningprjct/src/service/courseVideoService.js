// URLs del vídeo de un curso en Cloudinary. Funciones puras: la firma es local (API secret), sin red.
// - preview: los primeros 30 s; completo: el vídeo entero. Ambos con calidad y formato automáticos.
// - type 'authenticated': cada URL va firmada y la firma cubre la transformación, así que de la URL de
//   la preview no se puede sacar la del completo. Con 'upload' (público) eso NO se cumple: ver
//   scripts/migrarVideoAuthenticated.js.
import cloudinary from '../config/cloudinary.js';

export const PREVIEW_SECONDS = 30;
const TYPES = new Set(['upload', 'authenticated']);

export const videoType = () => (TYPES.has(process.env.CLOUDINARY_VIDEO_TYPE) ? process.env.CLOUDINARY_VIDEO_TYPE : 'upload');

const build = ({ publicId, version }, type, format, transformation) =>
  cloudinary.url(publicId, {
    resource_type: 'video',
    type,
    version,
    format,
    secure: true,
    sign_url: type === 'authenticated',
    transformation,
  });

// Anchos del póster de un tema (srcset): móvil, tablet, portátil y pantallas grandes / 2x
export const POSTER_WIDTHS = [640, 960, 1280, 1920];
const POSTER_OFFSET = 2; // segundos: el primer fotograma suele ser negro o un fundido

const SD_HEIGHT = 720;

/**
 * Vídeo explicativo de un tema, siempre completo (solo se pide con acceso de lectura al curso).
 * Sin HLS: en el plan Free los segmentos HLS de un asset 'authenticated' no se pueden firmar. En su lugar,
 * dos MP4 progresivos con calidad y formato automáticos; el front elige según pantalla y conexión.
 * - sd: 720p como máximo (móvil, ahorro de datos, conexión lenta). hd: resolución original.
 * - posters: fotograma a los 2 s en varios anchos (srcset), con formato automático (AVIF/WebP/JPEG).
 * El tipo de entrega lo dice el propio vídeo (`video.type`): firmadas si es 'authenticated'.
 */
export function temaVideoUrls(video) {
  const type = TYPES.has(video.type) ? video.type : 'upload';
  const posters = POSTER_WIDTHS.map((width) => ({
    width,
    url: build(video, type, 'jpg', [{ start_offset: POSTER_OFFSET }, { width, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]),
  }));
  return {
    sd: build(video, type, 'mp4', [{ height: SD_HEIGHT, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }]),
    hd: build(video, type, 'mp4', [{ quality: 'auto', fetch_format: 'auto' }]),
    poster: posters[1].url,
    posters,
  };
}

export function videoUrls(video, mode, type = 'upload') {
  const poster = build(video, type, 'jpg', [{ start_offset: 0, quality: 'auto' }]);
  if (mode === 'full') {
    return { src: build(video, type, 'mp4', [{ quality: 'auto', fetch_format: 'auto' }]), poster };
  }
  // Cualquier otro modo es preview: la URL completa solo se construye en la rama de arriba
  return {
    src: build(video, type, 'mp4', [{ start_offset: 0, end_offset: PREVIEW_SECONDS, quality: 'auto', fetch_format: 'auto' }]),
    poster,
  };
}
