import mongoose from 'mongoose';
import Course from '../models/Course.js';
import UserProgress from '../models/UserProgress.js';
import { accessFor, allows, isPrivate } from '../service/courseAccess.js';
import { videoFor } from '../config/courseVideos.js';
import { videoType, videoUrls } from '../service/courseVideoService.js';

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
