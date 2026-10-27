import mongoose from 'mongoose';
import Course from '../models/Course.js';
import UserProgress from '../models/UserProgress.js';
import { accessFor, allows, isPrivate } from '../service/courseAccess.js';
import { videoFor } from '../config/courseVideos.js';
import { temaVideoUrls, videoType, videoUrls } from '../service/courseVideoService.js';

/**
 * Vídeo del curso según quién lo pide: completo si está inscrito y el curso está abierto; si no, preview.
 * Sin sesión o con token inválido se responde como a un anónimo (optionalAuth). Cualquier duda → preview.
 * @route GET /api/courses/:id/video
 * @access Public (personalizado)
 */
export const obtenerVideoCurso = async (req, res) => {
  // Respuesta personal: ninguna caché compartida debe servírsela a otro alumno
  res.set('Cache-Control', 'private, no-store');
  res.vary('Authorization');
  try {
    const { id } = req.params;
    const video = mongoose.isValidObjectId(id) ? videoFor(id) : null;
    if (!video) return res.status(404).json({ error: 'Este curso no tiene vídeo' });

    const userId = req.user?.id;
    const [course, enrolled] = await Promise.all([
      Course.findById(id).select('isOpen accessMode').lean(),
      userId && mongoose.isValidObjectId(userId) ? UserProgress.exists({ userId, courseId: id }) : null,
    ]);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    // Curso público: abierto según el interruptor isOpen. Curso privado: lo abren las fechas de la
    // cohorte (acceso de lectura), el interruptor no cuenta
    const open = isPrivate(course) ? allows((await accessFor(req.user, course)).level, 'read') : course.isOpen === true;
    const mode = enrolled && open ? 'full' : 'preview';
    const { src, poster } = videoUrls(video, mode, videoType());
    res.json({ mode, src, poster });
  } catch (err) {
    console.error('Error al obtener el vídeo del curso:', err);
    res.status(500).json({ error: 'Error al obtener el vídeo del curso' });
  }
};

/**
 * Vídeo explicativo de un tema: URLs (firmadas si el asset es «authenticated») y pósters.
 * El acceso de lectura ya lo ha comprobado requireCourseAccess('read') en la ruta.
 * @route GET /api/courses/:id/temas/:temaId/video
 * @access Público en cursos públicos; en privados, miembros con acceso y admins
 */
export const obtenerVideoTema = async (req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  res.vary('Authorization');
  try {
    const { id, temaId } = req.params;
    if (!mongoose.isValidObjectId(temaId)) return res.status(404).json({ error: 'Tema no encontrado' });
    // Comparando como texto, igual que findCourseFile: no depende de cómo se guardó el _id del tema
    const course = await Course.findById(id).select('temas._id temas.video').lean();
    const video = course?.temas?.find((t) => String(t._id) === temaId)?.video;
    if (!video?.publicId) return res.status(404).json({ error: 'Este tema no tiene vídeo' });
    return res.json(temaVideoUrls(video));
  } catch (err) {
    return next(err);
  }
};
