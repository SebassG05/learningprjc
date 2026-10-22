import mongoose from 'mongoose';
import EntregaEjercicio from '../models/EntregaEjercicio.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sendExerciseCorrectionEmail } from '../service/mailService.js';
import { aplicarCorreccion, CorreccionError, debeNotificar, marcarNotificado } from '../service/correccionService.js';
import { buildListadoPipeline, formatListado, ListadoError, parseListado, usaListado } from '../service/entregasQueryService.js';
import User from '../models/User.js';
import Ejercicio from '../models/Ejercicio.js';
import Course from '../models/Course.js';
import { allows, canAccessCourse } from '../service/courseAccess.js';
import { courseIdOfEntrega, denyAccess } from '../middleware/courseAccess.js';
import { sendSubmissionFile, submissionFilePath } from '../service/materialFiles.js';

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
    const { comentarios } = req.body;
    // El curso lo fija requireCourseAccess a partir del ejercicio (el del body no es de fiar)
    const cursoId = req.courseAccess.course._id;

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
      const oldFilePath = submissionFilePath(entregaExistente);
      if (oldFilePath) {
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
      // Es una entrega nueva: su corrección se volverá a notificar aunque repita estado y nota
      entregaExistente.notificado = undefined;

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
    const filePath = submissionFilePath(entrega);
    if (filePath) {
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

/**
 * PDF de una entrega. Su autor lo ve si tiene acceso de lectura al curso; un admin, siempre.
 * A cualquier otro se le responde 404 (no se confirma que la entrega exista).
 * @route GET /api/entregas/:entregaId/archivo
 */
export const servirArchivoEntrega = async (req, res, next) => {
  try {
    const { entregaId } = req.params;
    const entrega = mongoose.isValidObjectId(entregaId) ? await EntregaEjercicio.findById(entregaId).lean() : null;
    const isAdmin = req.user.esAdmin();
    if (!entrega || (!isAdmin && String(entrega.userId) !== String(req.user._id))) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    if (!isAdmin) {
      const access = await canAccessCourse(req.user, await courseIdOfEntrega(entrega));
      if (!access) return res.status(404).json({ error: 'Entrega no encontrada' });
      if (!allows(access.level, 'read')) return denyAccess(res, access);
    }

    const filePath = submissionFilePath(entrega);
    if (!filePath || !fs.existsSync(filePath)) return res.status(404).json({ error: 'Archivo no encontrado' });
    return sendSubmissionFile(res, entrega, filePath);
  } catch (err) {
    return next(err);
  }
};

// ADMIN: Obtener todas las entregas (para corrección)
// Sin parámetros responde como siempre ({ entregas }). Con page/limit/estado/curso/q/desde/hasta/orden
// filtra, ordena y pagina en servidor y añade total, page, limit, pages y stats.
export const obtenerTodasLasEntregas = async (req, res) => {
  try {
    if (usaListado(req.query)) {
      let filtros;
      try {
        filtros = parseListado(req.query);
      } catch (err) {
        if (err instanceof ListadoError) return res.status(err.status).json({ error: err.message });
        throw err;
      }
      const colecciones = {
        users: User.collection.name,
        ejercicios: Ejercicio.collection.name,
        courses: Course.collection.name,
      };
      const resultado = await EntregaEjercicio.aggregate(buildListadoPipeline(filtros, colecciones));
      return res.json(formatListado(resultado, filtros));
    }

    const entregas = await EntregaEjercicio.find()
      .populate('ejercicioId', 'titulo tipo dificultad')
      .populate('userId', 'name email')
      .populate('cursoId', 'title titleEn')
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

    const entrega = await EntregaEjercicio.findById(id);

    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    try {
      aplicarCorreccion(entrega, req.body);
    } catch (err) {
      if (err instanceof CorreccionError) return res.status(err.status).json({ error: err.message });
      throw err;
    }

    await entrega.save();

    // Notificar al estudiante por correo (solo si cambió el estado o la nota desde el último aviso)
    if (debeNotificar(entrega)) {
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
          marcarNotificado(entrega);
          await entrega.save();
        }
      } catch (emailError) {
        console.error('Error al enviar email de corrección:', emailError);
      }
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
