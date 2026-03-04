import express from 'express';
import Course from '../models/Course.js';

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

export default router;
