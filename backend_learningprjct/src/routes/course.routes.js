import express from 'express';
import Course from '../models/Course.js';
import upload from '../middleware/upload.js';
import * as courseController from '../controller/courseController.js';

const router = express.Router();

// Obtener todos los cursos
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
});

// Crear curso (solo para admins, puedes añadir auth después)
router.post('/', async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear curso' });
  }
});

// Obtener curso por id
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el curso' });
  }
});

// Actualizar curso por id
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el curso' });
  }
});

// ============= RUTAS PARA TEMAS =============

// Agregar un tema al curso
router.post('/:id/temas', courseController.agregarTema);

// Actualizar un tema
router.put('/:id/temas/:temaId', courseController.actualizarTema);

// Eliminar un tema
router.delete('/:id/temas/:temaId', courseController.eliminarTema);

// ============= RUTAS PARA MATERIALES =============

// Agregar material a un tema (con soporte para subir archivos)
router.post('/:id/temas/:temaId/materiales', upload.single('archivo'), courseController.agregarMaterial);

// Eliminar un material de un tema
router.delete('/:id/temas/:temaId/materiales/:materialId', courseController.eliminarMaterial);

// ============= RUTAS PARA ACTIVIDADES OPTATIVAS =============

// Agregar actividad optativa a un tema (con soporte para subir archivos)
router.post('/:id/temas/:temaId/actividades-optativas', upload.single('archivo'), courseController.agregarActividadOptativa);

// Eliminar una actividad optativa de un tema
router.delete('/:id/temas/:temaId/actividades-optativas/:actividadId', courseController.eliminarActividadOptativa);

export default router;
