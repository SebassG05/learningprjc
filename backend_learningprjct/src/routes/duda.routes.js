// Rutas de Dudas. Cada llamada a buildDudaRouters crea sus propios limitadores (contadores en memoria por IP).
//
//   courseRouter   → /api/courses/:id/dudas   (lista y alta; el curso viene de la URL)
//   dudaRouter     → /api/dudas               (todo lo demás; el curso sale de la duda en la BD)
//   profesorRouter → /api/profesor            (GET /dudas)
//   adminRouter    → /api/admin/dudas         (autenticar + soloAdmin)
//
// Orden en cada ruta de escritura: sesión → acceso al curso (lectura) → participante → límite → validación → controlador.
// «Participante» solo filtra en los cursos públicos: inscritos, profesores del curso y admins (los privados
// ya los filtran las cohortes).
// La regla de publicar / moderar se aplica dentro del controlador con canPublish / canModerate.
import express from 'express';
import { body, query } from 'express-validator';
import { authenticateJWT } from '../middleware/auth.js';
import { autenticar, soloAdmin } from '../middleware/authorization.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import createRateLimit from '../middleware/rateLimit.js';
import { clientIp } from '../utils/requestInfo.js';
import { canModerate, loadViewer } from '../service/courseAccess.js';
import { courseIdFromDuda, fromParam, requireCourseAccess, requirePublicCourseParticipant } from '../middleware/courseAccess.js';
import { noStore } from '../controller/courseTeacherController.js';
import { DUDA_LIMITS } from '../models/Duda.js';
import {
  ACCIONES, ESTADOS, borrarDuda, borrarRespuesta, cambiarEstado, crearDuda, dudasAdmin, dudasProfesor,
  editarDuda, editarRespuesta, listarDudas, marcarVista, reportar, responder,
} from '../controller/dudaController.js';

export const DUDA_RATE_LIMITS = { preguntas: 10, respuestas: 30, ediciones: 30, reportes: 10 };
const HORA = 60 * 60 * 1000;

const required = (field, max, label) => body(field)
  .isString().withMessage(`${label} no es válido`)
  .bail().trim()
  .notEmpty().withMessage(`${label} no puede estar vacío`)
  .isLength({ max }).withMessage(`${label} no puede superar ${max} caracteres`);
const optionalText = (field, max, label) => body(field).optional()
  .isString().withMessage(`${label} no es válido`)
  .bail().trim()
  .notEmpty().withMessage(`${label} no puede estar vacío`)
  .isLength({ max }).withMessage(`${label} no puede superar ${max} caracteres`);

const crearRules = [
  body('temaId').isString().withMessage('El tema no es válido').bail().trim().notEmpty().withMessage('El tema es obligatorio'),
  body('lang').optional().isIn(['es', 'en']).withMessage('El idioma debe ser es o en'),
  required('titulo', DUDA_LIMITS.titulo, 'El título'),
  required('texto', DUDA_LIMITS.texto, 'El texto'),
];
const editarRules = [
  optionalText('titulo', DUDA_LIMITS.titulo, 'El título'),
  optionalText('texto', DUDA_LIMITS.texto, 'El texto'),
  body().custom((value) => value?.titulo !== undefined || value?.texto !== undefined).withMessage('No hay nada que cambiar'),
];
const respuestaRules = [required('texto', DUDA_LIMITS.respuesta, 'La respuesta')];
const estadoRules = [
  body('accion').isIn(ACCIONES).withMessage('La acción no es válida'),
  body('respuestaId').optional().isMongoId().withMessage('La respuesta no es válida'),
];
const reporteRules = [
  body('motivo').optional().isString().withMessage('El motivo no es válido').bail().trim()
    .isLength({ max: DUDA_LIMITS.motivo }).withMessage(`El motivo no puede superar ${DUDA_LIMITS.motivo} caracteres`),
];
const listaRules = [
  query('estado').optional().isIn(ESTADOS).withMessage('El estado no es válido'),
  query('temaId').optional().isString().withMessage('El tema no es válido'),
];
const adminRules = [
  query('estado').optional().isIn(ESTADOS).withMessage('El estado no es válido'),
  query('curso').optional().isMongoId().withMessage('El curso no es válido'),
];

export function buildDudaRouters({ limits } = {}) {
  const max = { ...DUDA_RATE_LIMITS, ...limits };
  // Por usuario (el JWT ya está verificado): la IP sale de cabeceras y no es fiable ni sirve tras un proxy
  const keyFn = (req) => (req.user?.id ? `u:${req.user.id}` : clientIp(req));
  const limiter = (n, message) => createRateLimit({ windowMs: HORA, max: n, message, keyFn });
  const preguntas = limiter(max.preguntas, 'Has hecho demasiadas preguntas. Prueba de nuevo más tarde.');
  const respuestas = limiter(max.respuestas, 'Has respondido demasiadas veces. Prueba de nuevo más tarde.');
  const ediciones = limiter(max.ediciones, 'Demasiados cambios seguidos. Prueba de nuevo más tarde.');
  // Quien modera (profesor del curso o admin) no gasta cupo en acciones de moderación
  const salvoModeracion = (limit) => async (req, res, next) => {
    const viewer = await loadViewer(req.user);
    return canModerate(req.courseAccess, viewer) ? next() : limit(req, res, next);
  };
  const reportes = limiter(max.reportes, 'Has enviado demasiados reportes. Prueba de nuevo más tarde.');

  const courseRouter = express.Router({ mergeParams: true });
  courseRouter.use(noStore, express.json());
  const cursoLeible = [requireCourseAccess('read', fromParam('id')), requirePublicCourseParticipant];
  courseRouter.get('/', optionalAuth, ...cursoLeible, listaRules, listarDudas);
  courseRouter.post('/', authenticateJWT, ...cursoLeible, preguntas, crearRules, crearDuda);

  const dudaRouter = express.Router();
  dudaRouter.use(noStore, express.json(), authenticateJWT);
  const acceso = [requireCourseAccess('read', courseIdFromDuda('dudaId')), requirePublicCourseParticipant];
  dudaRouter.patch('/:dudaId', acceso, ediciones, editarRules, editarDuda);
  dudaRouter.delete('/:dudaId', acceso, ediciones, borrarDuda);
  dudaRouter.post('/:dudaId/respuestas', acceso, respuestas, respuestaRules, responder);
  dudaRouter.patch('/:dudaId/respuestas/:respuestaId', acceso, ediciones, respuestaRules, editarRespuesta);
  dudaRouter.delete('/:dudaId/respuestas/:respuestaId', acceso, ediciones, borrarRespuesta);
  dudaRouter.patch('/:dudaId/estado', acceso, salvoModeracion(ediciones), estadoRules, cambiarEstado);
  dudaRouter.post('/:dudaId/vista', acceso, marcarVista);
  dudaRouter.post('/:dudaId/reportar', acceso, reportes, reporteRules, reportar);

  const profesorRouter = express.Router();
  profesorRouter.get('/dudas', noStore, authenticateJWT, dudasProfesor);

  const adminRouter = express.Router();
  adminRouter.use(noStore);
  adminRouter.get('/', autenticar, soloAdmin, adminRules, dudasAdmin);

  return { courseRouter, dudaRouter, profesorRouter, adminRouter };
}

export default buildDudaRouters();
