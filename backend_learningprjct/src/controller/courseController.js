import Course from '../models/Course.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Agregar un tema a un curso
export const agregarTema = async (req, res) => {
  try {
    const { id } = req.params;
    const { numeroTema, titulo, descripcion } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ 
        error: 'Curso no encontrado', 
        mensaje: `No existe ningún curso con el ID: ${id}. Verifica que el ID sea correcto.`
      });
    }

    // Inicializar el array de temas si no existe
    if (!course.temas) {
      course.temas = [];
    }

    // Verificar que no exista ya un tema con ese número
    const temaExistente = course.temas.find(t => t.numeroTema === parseInt(numeroTema));
    if (temaExistente) {
      return res.status(400).json({ 
        error: 'Ya existe un tema con ese número',
        mensaje: `El curso ya tiene un tema número ${numeroTema}. Usa otro número o actualiza el tema existente.`
      });
    }

    course.temas.push({
      numeroTema: parseInt(numeroTema),
      titulo,
      descripcion,
      materiales: []
    });

    await course.save();
    res.json(course);
  } catch (err) {
    console.error('Error al agregar tema:', err);
    res.status(500).json({ 
      error: 'Error al agregar tema', 
      mensaje: err.message || 'Error interno del servidor'
    });
  }
};

// Agregar material a un tema
export const agregarMaterial = async (req, res) => {
  try {
    const { id, temaId } = req.params;
    const { tipo, titulo, descripcion, archivo, orden } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    // Inicializar el array de temas si no existe
    if (!course.temas) {
      course.temas = [];
    }

    const tema = course.temas.id(temaId);
    if (!tema) {
      return res.status(404).json({ error: 'Tema no encontrado' });
    }

    // Inicializar el array de materiales si no existe
    if (!tema.materiales) {
      tema.materiales = [];
    }

    // Si se subió un archivo, usar la ruta del archivo
    let archivoPath = archivo;
    if (req.file) {
      archivoPath = `/courses/materiales/${req.file.filename}`;
    }

    tema.materiales.push({
      tipo,
      titulo,
      descripcion,
      archivo: archivoPath,
      orden: orden || tema.materiales.length
    });

    await course.save();
    res.json(course);
  } catch (err) {
    console.error('Error al agregar material:', err);
    res.status(500).json({ error: 'Error al agregar material', detalle: err.message });
  }
};

// Eliminar un material de un tema
export const eliminarMaterial = async (req, res) => {
  try {
    const { id, temaId, materialId } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    if (!course.temas) {
      return res.status(404).json({ error: 'El curso no tiene temas' });
    }

    const tema = course.temas.id(temaId);
    if (!tema) {
      return res.status(404).json({ error: 'Tema no encontrado' });
    }

    if (!tema.materiales) {
      return res.status(404).json({ error: 'El tema no tiene materiales' });
    }

    const material = tema.materiales.id(materialId);
    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    // Si el material tiene un archivo físico, eliminarlo
    if (material.archivo && material.archivo.startsWith('/courses/materiales/')) {
      const filePath = path.join(__dirname, '../../public', material.archivo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    tema.materiales.pull(materialId);
    await course.save();
    res.json(course);
  } catch (err) {
    console.error('Error al eliminar material:', err);
    res.status(500).json({ error: 'Error al eliminar material', detalle: err.message });
  }
};

// Actualizar un tema
export const actualizarTema = async (req, res) => {
  try {
    const { id, temaId } = req.params;
    const { titulo, descripcion } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    if (!course.temas) {
      return res.status(404).json({ error: 'El curso no tiene temas' });
    }

    const tema = course.temas.id(temaId);
    if (!tema) {
      return res.status(404).json({ error: 'Tema no encontrado' });
    }

    if (titulo) tema.titulo = titulo;
    if (descripcion) tema.descripcion = descripcion;

    await course.save();
    res.json(course);
  } catch (err) {
    console.error('Error al actualizar tema:', err);
    res.status(500).json({ error: 'Error al actualizar tema', detalle: err.message });
  }
};

// Eliminar un tema
export const eliminarTema = async (req, res) => {
  try {
    const { id, temaId } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    if (!course.temas) {
      return res.status(404).json({ error: 'El curso no tiene temas' });
    }

    const tema = course.temas.id(temaId);
    if (!tema) {
      return res.status(404).json({ error: 'Tema no encontrado' });
    }

    // Eliminar todos los archivos del tema
    if (tema.materiales) {
      tema.materiales.forEach(material => {
        if (material.archivo && material.archivo.startsWith('/courses/materiales/')) {
          const filePath = path.join(__dirname, '../../public', material.archivo);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    course.temas.pull(temaId);
    await course.save();
    res.json(course);
  } catch (err) {
    console.error('Error al eliminar tema:', err);
    res.status(500).json({ error: 'Error al eliminar tema', detalle: err.message });
  }
};
