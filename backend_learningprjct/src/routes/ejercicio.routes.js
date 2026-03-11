import { Router } from 'express';
import {
  obtenerEjerciciosCurso,
  obtenerEjercicioPorId,
  crearEjercicio,
  actualizarEjercicio,
  eliminarEjercicio
} from '../controller/ejercicioController.js';

const router = Router();

// Rutas públicas (para usuarios del curso)
router.get('/curso/:cursoId', obtenerEjerciciosCurso);
router.get('/:ejercicioId', obtenerEjercicioPorId);

// Rutas de administración (agregar middleware de autenticación si es necesario)
router.post('/', crearEjercicio);
router.put('/:ejercicioId', actualizarEjercicio);
router.delete('/:ejercicioId', eliminarEjercicio);

export default router;
