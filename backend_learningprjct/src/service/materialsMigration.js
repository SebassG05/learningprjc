// Mueve los archivos de un curso (materiales y actividades optativas, ES y EN) entre los tipos de entrega
// de Cloudinary «upload» (URL pública) y «authenticated» (solo con URL firmada), y guarda la URL nueva.
// Tras pasar a «authenticated», las URLs antiguas dejan de funcionar (se invalida la CDN) y el contenido
// solo se obtiene a través de GET /api/courses/:id/materiales/:materialId, que comprueba el acceso.
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import Course from '../models/Course.js';
import { cloudinaryRawAsset, isOwnCloudinaryUrl } from './materialFiles.js';

const FILE_FIELDS = ['archivo', 'archivoEn'];
const LISTS = ['materiales', 'actividadesOptativas'];

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
  for (const tema of course.temas) {
    for (const list of LISTS) {
      for (const item of tema[list] ?? []) {
        for (const field of FILE_FIELDS) {
          const url = item[field];
          if (!isOwnCloudinaryUrl(url)) continue;
          const asset = cloudinaryRawAsset(url);
          if (!asset) continue;
          const entry = { tema: tema.numeroTema, titulo: item.titulo ?? '', field, publicId: asset.publicId };
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
              resource_type: 'raw',
              type: from,
              to_type: to,
              invalidate: true,
            });
            item[field] = result.secure_url;
            await course.save(); // archivo a archivo: si algo falla a medias, lo hecho queda guardado
            entry.status = 'done';
          } catch (err) {
            entry.status = 'error';
            entry.error = err.message ?? String(err);
          }
        }
      }
    }
  }
  return { course: { _id: String(course._id), title: course.title }, to, files };
}
