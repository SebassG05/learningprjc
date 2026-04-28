import express from 'express';
import Course from '../models/Course.js';
import upload from '../middleware/upload.js';
import * as courseController from '../controller/courseController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { autenticar, soloAdmin } from '../middleware/authorization.js';

const router = express.Router();

// ============= CRUD DE CURSOS COMPLETOS =============

// Obtener todos los cursos (público)
router.get('/', courseController.obtenerCursos);

// Obtener curso por id (público)
router.get('/:id', courseController.obtenerCurso);

// Crear curso (solo admin/superadmin) - con soporte para subir imagen
router.post('/', autenticar, soloAdmin, upload.single('image'), courseController.crearCurso);

// Actualizar curso por id (solo admin/superadmin) - con soporte para actualizar imagen
router.put('/:id', autenticar, soloAdmin, upload.single('image'), courseController.actualizarCurso);

// Eliminar curso (solo admin/superadmin)
router.delete('/:id', autenticar, soloAdmin, courseController.eliminarCurso);

// Abrir / cerrar curso (admin)
router.put('/:id/toggle-open', autenticar, soloAdmin, courseController.toggleCourseOpen);

// ============= RUTAS PARA TEMAS =============

// Agregar un tema al curso (solo admin)
router.post('/:id/temas', autenticar, soloAdmin, courseController.agregarTema);

// Actualizar un tema (solo admin)
router.put('/:id/temas/:temaId', autenticar, soloAdmin, courseController.actualizarTema);

// Eliminar un tema (solo admin)
router.delete('/:id/temas/:temaId', autenticar, soloAdmin, courseController.eliminarTema);

// ============= RUTAS PARA MATERIALES =============

// Agregar material a un tema (solo admin, con soporte para subir archivos en múltiples idiomas)
router.post('/:id/temas/:temaId/materiales', autenticar, soloAdmin, upload.fields([{ name: 'archivo', maxCount: 1 }, { name: 'archivoEn', maxCount: 1 }]), courseController.agregarMaterial);

// Eliminar un material de un tema (solo admin)
router.delete('/:id/temas/:temaId/materiales/:materialId', autenticar, soloAdmin, courseController.eliminarMaterial);

// ============= RUTAS PARA ACTIVIDADES OPTATIVAS =============

// Agregar actividad optativa a un tema (solo admin, con soporte para subir archivos)
router.post('/:id/temas/:temaId/actividades-optativas', autenticar, soloAdmin, upload.single('archivo'), courseController.agregarActividadOptativa);

// Eliminar una actividad optativa de un tema (solo admin)
router.delete('/:id/temas/:temaId/actividades-optativas/:actividadId', autenticar, soloAdmin, courseController.eliminarActividadOptativa);

export default router;
