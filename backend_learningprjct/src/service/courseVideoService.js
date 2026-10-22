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
