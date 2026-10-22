import Course from '../models/Course.js';
import cloudinary from '../config/cloudinary.js';
import { accessFor, allows, isPrivate } from '../service/courseAccess.js';
import { denyAccess } from '../middleware/courseAccess.js';
import { cloudinaryRawAsset, isOwnCloudinaryUrl, pipeFromCloudinary } from '../service/materialFiles.js';

// Campos del curso que guardan URLs de archivos
const FILE_FIELDS = [
  'temas.materiales.archivo',
  'temas.materiales.archivoEn',
  'temas.actividadesOptativas.archivo',
  'temas.actividadesOptativas.archivoEn',
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Cualquier URL guardada de ese mismo asset (con o sin versión, firma o tipo distintos)
const sameAssetPattern = (publicId) =>
  new RegExp(`^https://res\\.cloudinary\\.com/${escapeRegex(cloudinary.config().cloud_name)}/raw/(upload|authenticated)/(s--[\\w-]+--/)?(v\\d+/)?${escapeRegex(publicId)}$`);

/**
 * Sirve un PDF de material con cabeceras para verlo en línea (lo usaba el aula antes de la pasarela;
 * se mantiene para clientes con la versión anterior en caché).
 * - Solo archivos «upload» de nuestra cuenta que sean material de algún curso: no es un proxy abierto
 *   y nunca firma (los «authenticated» solo los sirve GET /api/courses/:id/materiales/:materialId).
 * - El curso se busca por public_id, no por la URL exacta: retocar la URL no salta la comprobación.
 * - Si el material es de un curso privado, exige acceso de lectura (optionalAuth en la ruta).
 * @route GET /api/pdf-proxy?url=
 */
export const proxyPdf = async (req, res, next) => {
  try {
    const { url } = req.query;
    const asset = typeof url === 'string' && isOwnCloudinaryUrl(url) ? cloudinaryRawAsset(url) : null;
    if (!asset || asset.type !== 'upload') {
      return res.status(400).json({ error: 'URL inválida' });
    }

    const pattern = sameAssetPattern(asset.publicId);
    const courses = await Course.find({ $or: FILE_FIELDS.map((f) => ({ [f]: pattern })) }).select('_id accessMode').lean();
    if (courses.length === 0) return res.status(404).json({ error: 'Material no encontrado' });

    // Basta con poder leer uno de los cursos que lo usan; si todos son públicos, no hace falta sesión
    if (!courses.some((c) => !isPrivate(c))) {
      let denied = null;
      for (const course of courses) {
        const access = await accessFor(req.user, course);
        if (allows(access.level, 'read')) {
          denied = null;
          break;
        }
        denied ??= access;
      }
      if (denied) return denyAccess(res, denied);
    }

    return await pipeFromCloudinary(res, url);
  } catch (err) {
    return next(err);
  }
};
