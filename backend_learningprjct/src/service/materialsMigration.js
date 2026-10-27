// Mueve los archivos de un curso (materiales y actividades optativas, ES y EN, y el vídeo de cada tema)
// entre los tipos de entrega de Cloudinary «upload» (URL pública) y «authenticated» (solo con URL firmada),
// y guarda la URL o el tipo nuevo. Tras pasar a «authenticated», las URLs antiguas dejan de funcionar
// (se invalida la CDN): los PDFs solo se obtienen por GET /api/courses/:id/materiales/:materialId y los
// vídeos con las URLs firmadas de GET /api/courses/:id/temas/:temaId/video, que comprueban el acceso.
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import Course from '../models/Course.js';
import { cloudinaryFileAsset, isOwnCloudinaryUrl } from './materialFiles.js';

const FILE_FIELDS = ['archivo', 'archivoEn'];
const LISTS = ['materiales', 'actividadesOptativas'];

// Cada archivo migrable del curso: qué asset es y cómo guardar el resultado del renombrado
function* courseAssets(course) {
  for (const tema of course.temas) {
    for (const list of LISTS) {
      for (const item of tema[list] ?? []) {
        for (const field of FILE_FIELDS) {
          const url = item[field];
          const asset = isOwnCloudinaryUrl(url) ? cloudinaryFileAsset(url) : null;
          if (!asset) continue;
          yield {
            tema: tema.numeroTema,
            titulo: item.titulo ?? '',
            field,
            asset,
            save: (result) => { item[field] = result.secure_url; },
          };
        }
      }
    }
    if (tema.video?.publicId) {
      yield {
        tema: tema.numeroTema,
        titulo: tema.titulo ?? '',
        field: 'video',
        asset: { resourceType: 'video', type: tema.video.type ?? 'upload', publicId: tema.video.publicId },
        save: (result) => {
          tema.video.type = result.type;
          tema.video.version = result.version;
        },
      };
    }
  }
}

/**
 * @param {{ courseId, to: 'authenticated'|'upload', apply?: boolean, api?: { rename } }} input
 * @returns {Promise<{ course, to, files: Array<{ tema, titulo, field, publicId, status: 'pending'|'done'|'skipped'|'error', error? }> }>}
 */
export async function migrateCourseMaterials({ courseId, to, apply = false, api = cloudinary.uploader }) {
  if (!['authenticated', 'upload'].includes(to)) throw new Error(`Tipo de destino no válido: ${to}`);
  const from = to === 'authenticated' ? 'upload' : 'authenticated';
  if (!mongoose.isValidObjectId(courseId)) throw new Error(`Id de curso no válido: ${courseId}`);
  const course = await Course.findById(courseId);
  if (!course) throw new Error(`El curso ${courseId} no existe`);

  const files = [];
  for (const { tema, titulo, field, asset, save } of courseAssets(course)) {
    const entry = { tema, titulo, field, publicId: asset.publicId };
    files.push(entry);

    if (asset.type === to) {
      entry.status = 'skipped';
      continue;
    }
    if (!apply) {
      entry.status = 'pending';
      continue;
    }
    try {
      const result = await api.rename(asset.publicId, asset.publicId, {
        resource_type: asset.resourceType,
        type: from,
        to_type: to,
        invalidate: true,
      });
      save(result);
      await course.save(); // archivo a archivo: si algo falla a medias, lo hecho queda guardado
      entry.status = 'done';
    } catch (err) {
      entry.status = 'error';
      entry.error = err.message ?? String(err);
    }
  }
  return { course: { _id: String(course._id), title: course.title }, to, files };
}
