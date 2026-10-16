import mongoose from 'mongoose';
import Course from '../models/Course.js';
import TermsAcceptance from '../models/TermsAcceptance.js';
import { currentTermsVersion, isValidAcceptance, publicTerms, recordAcceptance, termsRequired } from '../service/termsService.js';

const isProd = () => process.env.NODE_ENV === 'production';

/**
 * Texto vigente de los términos (único origen: src/content/terms.js)
 * @route GET /api/terms/current
 * @access Public
 */
export const getCurrentTerms = (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(publicTerms());
};

/**
 * ¿Ha aceptado el alumno la versión vigente para este curso?
 * @route GET /api/terms/status/:courseId
 * @access Private
 */
export const getTermsStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.isValidObjectId(courseId)) return res.status(400).json({ error: 'Curso no válido' });
    const version = currentTermsVersion();
    const record = await TermsAcceptance.findOne({ userId: req.user.id, courseId, termsVersion: version })
      .select('acceptedAt')
      .lean();
    res.json({ version, accepted: Boolean(record), acceptedAt: record?.acceptedAt ?? null });
  } catch (err) {
    console.error('Error en getTermsStatus:', err);
    res.status(500).json({ error: 'Error al consultar los términos', ...(isProd() ? {} : { details: err.message }) });
  }
};

/**
 * Aceptar la versión vigente (alumnos ya inscritos a los que se vuelve a pedir tras un cambio de versión)
 * @route POST /api/terms/accept/:courseId
 * @access Private
 */
export const acceptTerms = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!mongoose.isValidObjectId(courseId)) return res.status(400).json({ error: 'Curso no válido' });
    if (!isValidAcceptance(req.body)) return res.status(400).json(termsRequired());
    if (!(await Course.exists({ _id: courseId }))) return res.status(404).json({ error: 'Curso no encontrado' });
    const record = await recordAcceptance(req, req.user.id, courseId);
    res.status(201).json({ version: record.termsVersion, accepted: true, acceptedAt: record.acceptedAt });
  } catch (err) {
    console.error('Error en acceptTerms:', err);
    res.status(500).json({ error: 'Error al guardar la aceptación', ...(isProd() ? {} : { details: err.message }) });
  }
};
