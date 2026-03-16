import EntregaEjercicio from '../models/EntregaEjercicio.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

// Obtener las entregas de un usuario para un ejercicio
export const obtenerEntregaUsuario = async (req, res) => {
  try {
    const { ejercicioId } = req.params;
    const userId = req.user.id;

    const entrega = await EntregaEjercicio.findOne({ 
      ejercicioId, 
      userId 
    }).populate('ejercicioId', 'titulo tipo');

    if (!entrega) {
      return res.json({ entregado: false });
    }

    res.json({ 
      entregado: true, 
      entrega 
    });
  } catch (error) {
    console.error('Error al obtener entrega:', error);
    res.status(500).json({ error: 'Error al obtener entrega' });
  }
};

// Enviar/actualizar entrega de ejercicio
export const entregarEjercicio = async (req, res) => {
  try {
    const { ejercicioId } = req.params;
    const userId = req.user.id;
    const { cursoId, comentarios } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Debes adjuntar un archivo PDF' });
    }

    // Subir PDF a Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ejercicios',
          resource_type: 'raw',
          format: 'pdf',
          public_id: `ejercicio_${ejercicioId}_user_${userId}_${Date.now()}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const bufferStream = Readable.from(req.file.buffer);
      bufferStream.pipe(uploadStream);
    });

    const uploadResult = await uploadPromise;

    // Buscar si ya existe una entrega
    const entregaExistente = await EntregaEjercicio.findOne({ 
      ejercicioId, 
      userId 
    });

    if (entregaExistente) {
      // Eliminar el archivo anterior de Cloudinary
      if (entregaExistente.archivoPdf?.publicId) {
        await cloudinary.uploader.destroy(entregaExistente.archivoPdf.publicId, {
          resource_type: 'raw'
        });
      }

      // Actualizar entrega existente
      entregaExistente.archivoPdf = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        nombreOriginal: req.file.originalname
      };
      entregaExistente.comentarios = comentarios;
      entregaExistente.estado = 'enviado';
      entregaExistente.fechaEntrega = new Date();

      await entregaExistente.save();

      return res.json({
        message: 'Entrega actualizada exitosamente',
        entrega: entregaExistente
      });
    }

    // Crear nueva entrega
    const nuevaEntrega = new EntregaEjercicio({
      ejercicioId,
      userId,
      cursoId,
      archivoPdf: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        nombreOriginal: req.file.originalname
      },
      comentarios,
      estado: 'enviado'
    });

    await nuevaEntrega.save();

    res.status(201).json({
      message: 'Ejercicio entregado exitosamente',
      entrega: nuevaEntrega
    });

  } catch (error) {
    console.error('Error al entregar ejercicio:', error);
    res.status(500).json({ 
      error: 'Error al procesar la entrega',
      detalle: error.message 
    });
  }
};

// Obtener todas las entregas de un usuario en un curso
export const obtenerEntregasUsuarioCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const userId = req.user.id;

    const entregas = await EntregaEjercicio.find({ 
      cursoId, 
      userId 
    }).populate('ejercicioId', 'titulo tipo dificultad')
      .sort({ fechaEntrega: -1 });

    res.json(entregas);
  } catch (error) {
    console.error('Error al obtener entregas:', error);
    res.status(500).json({ error: 'Error al obtener entregas' });
  }
};

// Eliminar entrega (si el usuario quiere rehacer el ejercicio)
export const eliminarEntrega = async (req, res) => {
  try {
    const { entregaId } = req.params;
    const userId = req.user.id;

    const entrega = await EntregaEjercicio.findOne({ 
      _id: entregaId, 
      userId 
    });

    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    // Eliminar archivo de Cloudinary
    if (entrega.archivoPdf?.publicId) {
      await cloudinary.uploader.destroy(entrega.archivoPdf.publicId, {
        resource_type: 'raw'
      });
    }

    await EntregaEjercicio.deleteOne({ _id: entregaId });

    res.json({ message: 'Entrega eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar entrega:', error);
    res.status(500).json({ error: 'Error al eliminar entrega' });
  }
};

// ADMIN: Obtener todas las entregas (para corrección)
export const obtenerTodasLasEntregas = async (req, res) => {
  try {
    const entregas = await EntregaEjercicio.find()
      .populate('ejercicioId', 'titulo tipo dificultad')
      .populate('userId', 'name email')
      .populate('cursoId', 'titulo')
      .sort({ fechaEntrega: -1 });

    res.json({ entregas });
  } catch (error) {
    console.error('Error al obtener entregas:', error);
    res.status(500).json({ error: 'Error al obtener entregas' });
  }
};

// ADMIN: Corregir una entrega
export const corregirEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const { calificacion, feedbackProfesor, estado } = req.body;

    const entrega = await EntregaEjercicio.findById(id);

    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    // Actualizar campos
    if (calificacion !== undefined) {
      if (calificacion < 0 || calificacion > 10) {
        return res.status(400).json({ error: 'La calificación debe estar entre 0 y 10' });
      }
      entrega.calificacion = calificacion;
    }

    if (feedbackProfesor !== undefined) {
      entrega.feedbackProfesor = feedbackProfesor;
    }

    if (estado) {
      const estadosValidos = ['enviado', 'revisado', 'aprobado', 'rechazado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido' });
      }
      entrega.estado = estado;
    }

    entrega.fechaRevision = new Date();

    await entrega.save();

    res.json({
      message: 'Corrección guardada exitosamente',
      entrega
    });
  } catch (error) {
    console.error('Error al corregir entrega:', error);
    res.status(500).json({ 
      error: 'Error al corregir entrega',
      detalle: error.message 
    });
  }
};
