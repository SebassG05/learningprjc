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

export default router;
