import EntregaEjercicio from '../models/EntregaEjercicio.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sendExerciseCorrectionEmail } from '../service/mailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio para PDFs si no existe - usar ruta absoluta desde la raíz del proyecto
const projectRoot = path.join(__dirname, '../..');
const uploadsDir = path.join(projectRoot, 'public/ejercicios');

console.log('📁 Directorio de uploads:', uploadsDir);

// Asegurarse de que el directorio existe
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creando directorio:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Directorio creado');
} else {
  console.log('✅ Directorio ya existe');
}

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

    console.log('📥 Nueva entrega recibida:', { ejercicioId, userId, cursoId });

    if (!req.file) {
      console.error('❌ No se recibió archivo');
      return res.status(400).json({ error: 'Debes adjuntar un archivo PDF' });
    }

    console.log('📄 Archivo recibido:', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Generar nombre único para el archivo
    const fileName = `ejercicio_${ejercicioId}_user_${userId}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    const fileUrl = `/ejercicios/${fileName}`;

    // Guardar archivo en el servidor
    console.log('💾 Guardando archivo en:', filePath);
    fs.writeFileSync(filePath, req.file.buffer);
    console.log('✅ Archivo guardado exitosamente');

    // Buscar si ya existe una entrega
    const entregaExistente = await EntregaEjercicio.findOne({ 
      ejercicioId, 
      userId 
    });

    console.log('🔍 Entrega existente:', entregaExistente ? 'Sí' : 'No');

    if (entregaExistente) {
      // Verificar si está bloqueado
      if (entregaExistente.bloqueado) {
        return res.status(403).json({ error: 'Este ejercicio está bloqueado. Has agotado los intentos disponibles.' });
      }
      // Eliminar el archivo anterior
      if (entregaExistente.archivoPdf?.filePath) {
        const oldFilePath = path.join(__dirname, '../../public', entregaExistente.archivoPdf.filePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log('🗑️ Archivo anterior eliminado');
        }
      }

      // Actualizar entrega existente
      entregaExistente.archivoPdf = {
        url: fileUrl,
        filePath: fileUrl,
        nombreOriginal: req.file.originalname
      };
      entregaExistente.comentarios = comentarios;
      entregaExistente.estado = 'enviado';
      entregaExistente.fechaEntrega = new Date();

      await entregaExistente.save();

      console.log('✅ Entrega actualizada exitosamente');
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
        url: fileUrl,
        filePath: fileUrl,
        nombreOriginal: req.file.originalname
      },
      comentarios,
      estado: 'enviado'
    });

    await nuevaEntrega.save();

    console.log('✅ Nueva entrega creada exitosamente');
    res.status(201).json({
      message: 'Ejercicio entregado exitosamente',
      entrega: nuevaEntrega
    });

  } catch (error) {
    console.error('❌ Error completo:', error);
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

    // Eliminar archivo del servidor
    if (entrega.archivoPdf?.filePath) {
      const filePath = path.join(__dirname, '../../public', entrega.archivoPdf.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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
      // Si se rechaza, incrementar intentos y bloquear al 2º rechazo
      if (estado === 'rechazado') {
        entrega.intentos = (entrega.intentos || 0) + 1;
        if (entrega.intentos >= 2) {
          entrega.bloqueado = true;
        }
      }
      entrega.estado = estado;
    }

    entrega.fechaRevision = new Date();

    await entrega.save();

    // Notificar al estudiante por correo
    try {
      const entregaPopulada = await EntregaEjercicio.findById(entrega._id)
        .populate('userId', 'name email')
        .populate('ejercicioId', 'titulo');
      if (entregaPopulada?.userId?.email) {
        await sendExerciseCorrectionEmail({
          userName: entregaPopulada.userId.name,
          userEmail: entregaPopulada.userId.email,
          ejercicioTitulo: entregaPopulada.ejercicioId?.titulo || 'Ejercicio',
          calificacion: entregaPopulada.calificacion,
          feedbackProfesor: entregaPopulada.feedbackProfesor,
          estado: entregaPopulada.estado
        });
      }
    } catch (emailError) {
      console.error('Error al enviar email de corrección:', emailError);
    }

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
