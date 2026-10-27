import path from 'node:path';
import Course from '../models/Course.js';
import { findCourseFile, isOwnCloudinaryUrl, pipeFromCloudinary } from '../service/materialFiles.js';
import { noSharedCache } from '../middleware/courseAccess.js';
import { signMaterialTicket } from '../config/jwt.js';

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
    // El ticket va en la URL: que no salga en el Referer si el PDF tuviera enlaces
    if (req.viaTicket) res.set('Referrer-Policy', 'no-referrer');
    // Única llamada que puede firmar: el acceso ya lo ha comprobado requireCourseAccess('read')
    return await pipeFromCloudinary(res, stored, { sign: true, filename });
  } catch (err) {
    return next(err);
  }
};

/**
 * Enlace de corta duración (60 s) para abrir un material en una pestaña nueva con el visor nativo del
 * sistema (móvil): GET /api/courses/:id/materiales/:materialId?ticket=…, que vuelve a comprobar el acceso.
 * @route POST /api/courses/:id/materiales/:materialId/enlace
 * @access Con sesión y acceso de lectura al curso
 */
export const crearEnlaceMaterial = async (req, res, next) => {
  noSharedCache(res);
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Inicia sesión para abrir el material' });
    const course = await Course.findById(req.params.id).select('temas').lean();
    if (!course || !findCourseFile(course, req.params.materialId)) return res.status(404).json({ error: 'Material no encontrado' });
    const ticket = signMaterialTicket({ userId: req.user.id, courseId: req.params.id, materialId: req.params.materialId });
    return res.json({ path: `/api/courses/${req.params.id}/materiales/${req.params.materialId}?ticket=${encodeURIComponent(ticket)}` });
  } catch (err) {
    return next(err);
  }
};
