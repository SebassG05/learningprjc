import { Router } from 'express';
import {
  obtenerEjerciciosCurso,
  obtenerEjercicioPorId,
  crearEjercicio,
  actualizarEjercicio,
  eliminarEjercicio
} from '../controller/ejercicioController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { autenticar, soloAdmin } from '../middleware/authorization.js';
import { courseIdFromEjercicio, fromParam, requireCourseAccess } from '../middleware/courseAccess.js';

const router = Router();

// Lectura: pública en cursos públicos; en privados, solo con acceso (cohorte o admin)
router.get('/curso/:cursoId', optionalAuth, requireCourseAccess('read', fromParam('cursoId')), obtenerEjerciciosCurso);
router.get('/:ejercicioId', optionalAuth, requireCourseAccess('read', courseIdFromEjercicio()), obtenerEjercicioPorId);

// Administración
router.post('/', autenticar, soloAdmin, crearEjercicio);
router.put('/:ejercicioId', autenticar, soloAdmin, actualizarEjercicio);
router.delete('/:ejercicioId', autenticar, soloAdmin, eliminarEjercicio);

export default router;
