import Course from '../models/Course.js';
import cloudinary from '../config/cloudinary.js';

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

    // Si se subió un archivo, usar la URL de Cloudinary
    let archivoPath = archivo;
    if (req.file) {
      // Cloudinary almacena la URL en req.file.path
      archivoPath = req.file.path;
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

    // Si el material tiene un archivo en Cloudinary, eliminarlo
    if (material.archivo && material.archivo.includes('cloudinary.com')) {
      try {
        // Extraer el public_id de la URL de Cloudinary
        const urlParts = material.archivo.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId = `learning-platform/materiales/${fileWithExt.split('.')[0]}`;
        
        // Eliminar de Cloudinary
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      } catch (cloudinaryError) {
        console.error('Error al eliminar archivo de Cloudinary:', cloudinaryError);
        // Continuar aunque falle la eliminación en Cloudinary
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

    // Eliminar todos los archivos del tema de Cloudinary
    if (tema.materiales) {
      for (const material of tema.materiales) {
        if (material.archivo && material.archivo.includes('cloudinary.com')) {
          try {
            const urlParts = material.archivo.split('/');
            const fileWithExt = urlParts[urlParts.length - 1];
            const publicId = `learning-platform/materiales/${fileWithExt.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
          } catch (cloudinaryError) {
            console.error('Error al eliminar archivo de Cloudinary:', cloudinaryError);
          }
        }
      }
    }

    // Eliminar actividades optativas de Cloudinary
    if (tema.actividadesOptativas) {
      for (const actividad of tema.actividadesOptativas) {
        if (actividad.archivo && actividad.archivo.includes('cloudinary.com')) {
          try {
            const urlParts = actividad.archivo.split('/');
            const fileWithExt = urlParts[urlParts.length - 1];
            const publicId = `learning-platform/materiales/${fileWithExt.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
          } catch (cloudinaryError) {
            console.error('Error al eliminar archivo de Cloudinary:', cloudinaryError);
          }
        }
      }
    }

    course.temas.pull(temaId);
    await course.save();
    res.json(course);
  } catch (err) {
    console.error('Error al eliminar tema:', err);
    res.status(500).json({ error: 'Error al eliminar tema', detalle: err.message });
  }
};

// ============= ACTIVIDADES OPTATIVAS =============

// Agregar actividad optativa a un tema
export const agregarActividadOptativa = async (req, res) => {
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

    // Inicializar el array de actividades optativas si no existe
    if (!tema.actividadesOptativas) {
      tema.actividadesOptativas = [];
    }

    // Si se subió un archivo, usar la URL de Cloudinary
    let archivoPath = archivo;
    if (req.file) {
      archivoPath = req.file.path;
    }

    tema.actividadesOptativas.push({
      tipo,
      titulo,
      descripcion,
      archivo: archivoPath,
      orden: orden || tema.actividadesOptativas.length
    });

    await course.save();
    res.json(course);
  } catch (err) {
    console.error('Error al agregar actividad optativa:', err);
    res.status(500).json({ error: 'Error al agregar actividad optativa', detalle: err.message });
  }
};

// Eliminar una actividad optativa de un tema
export const eliminarActividadOptativa = async (req, res) => {
  try {
    const { id, temaId, actividadId } = req.params;

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

    if (!tema.actividadesOptativas) {
      return res.status(404).json({ error: 'El tema no tiene actividades optativas' });
    }

    const actividad = tema.actividadesOptativas.id(actividadId);
    if (!actividad) {
      return res.status(404).json({ error: 'Actividad optativa no encontrada' });
    }

    // Si la actividad tiene un archivo en Cloudinary, eliminarlo
    if (actividad.archivo && actividad.archivo.includes('cloudinary.com')) {
      try {
        const urlParts = actividad.archivo.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId = `learning-platform/materiales/${fileWithExt.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      } catch (cloudinaryError) {
        console.error('Error al eliminar archivo de Cloudinary:', cloudinaryError);
      }
    }

    tema.actividadesOptativas.pull(actividadId);
    await course.save();
    res.json(course);
  } catch (err) {
    console.error('Error al eliminar actividad optativa:', err);
    res.status(500).json({ error: 'Error al eliminar actividad optativa', detalle: err.message });
  }
};
