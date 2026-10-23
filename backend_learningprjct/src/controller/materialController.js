import path from 'node:path';
import Course from '../models/Course.js';
import { findCourseFile, isOwnCloudinaryUrl, pipeFromCloudinary } from '../service/materialFiles.js';
import { noSharedCache } from '../middleware/courseAccess.js';

/**
 * Material o actividad optativa de un tema, servido por el backend tras comprobar el acceso
 * (requireCourseAccess('read') en la ruta). ?lang=en pide la versión en inglés si existe.
 * Un enlace externo no se descarga: se devuelve su URL en JSON.
 * @route GET /api/courses/:id/materiales/:materialId
 * @access Público en cursos públicos; en privados, miembros con acceso y admins
 */
export const servirMaterial = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).select('temas').lean();
    const file = course && findCourseFile(course, req.params.materialId);
    const stored = req.query.lang === 'en' ? file?.archivoEn || file?.archivo : file?.archivo || file?.archivoEn;
    if (!stored) return res.status(404).json({ error: 'Material no encontrado' });

    if (!isOwnCloudinaryUrl(stored)) {
      noSharedCache(res);
      return res.json({ url: stored });
    }
    // upload.js sube los PDFs sin extensión en el public_id: sin «.pdf» se servirían como octet-stream
    // y el navegador no los mostraría en el <iframe>
    let filename = path.basename(new URL(stored).pathname);
    if (file.tipo === 'pdf' && !/\.pdf$/i.test(filename)) filename += '.pdf';
    // Única llamada que puede firmar: el acceso ya lo ha comprobado requireCourseAccess('read')
    return await pipeFromCloudinary(res, stored, { sign: true, filename });
  } catch (err) {
    return next(err);
  }
};
