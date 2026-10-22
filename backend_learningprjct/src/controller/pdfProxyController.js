import Course from '../models/Course.js';
import { accessFor, allows } from '../service/courseAccess.js';
import { denyAccess } from '../middleware/courseAccess.js';
import { isOwnCloudinaryUrl, pipeFromCloudinary } from '../service/materialFiles.js';

// Campos del curso que guardan URLs de archivos
const FILE_FIELDS = [
  'temas.materiales.archivo',
  'temas.materiales.archivoEn',
  'temas.actividadesOptativas.archivo',
  'temas.actividadesOptativas.archivoEn',
];

/**
 * Sirve un PDF de Cloudinary con cabeceras para verlo en línea.
 * - Solo URLs de nuestra cuenta (https://res.cloudinary.com/<cloud>/…): no es un proxy abierto.
 * - Si la URL es material de un curso privado, exige acceso de lectura (optionalAuth en la ruta).
 * @route GET /api/pdf-proxy?url=
 */
export const proxyPdf = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (typeof url !== 'string' || !isOwnCloudinaryUrl(url)) {
      return res.status(400).json({ error: 'URL inválida' });
    }

    const privateCourse = await Course.findOne({ accessMode: 'private', $or: FILE_FIELDS.map((f) => ({ [f]: url })) })
      .select('_id accessMode')
      .lean();
    if (privateCourse) {
      const access = await accessFor(req.user, privateCourse);
      if (!allows(access.level, 'read')) return denyAccess(res, access);
    }

    return await pipeFromCloudinary(res, url);
  } catch (err) {
    return next(err);
  }
};
