import express from 'express';
import Course from '../models/Course.js';
import upload, { handleMulterError } from '../middleware/upload.js';
import * as courseController from '../controller/courseController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { autenticar, soloAdmin } from '../middleware/authorization.js';

const router = express.Router();

// Wrapper para capturar errores de upload (single file)
const uploadSingleWrapper = (fieldName) => {
  return (req, res, next) => {
    console.log(`\n🚀 [ROUTE] Iniciando upload SINGLE para campo: ${fieldName}`);
    console.log('📋 [ROUTE] Headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });
    
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error(`\n💥 [ROUTE] Error capturado en uploadSingleWrapper:`, err);
        return handleMulterError(err, req, res, next);
      }
      
      console.log(`✅ [ROUTE] Upload SINGLE completado para ${fieldName}`);
      if (req.file) {
        console.log('📁 [ROUTE] Archivo procesado:', {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        });
      } else {
        console.log('ℹ️ [ROUTE] No se recibió archivo');
      }
      
      next();
    });
  };
};

// Wrapper para capturar errores de upload (multiple fields)
const uploadFieldsWrapper = (fields) => {
  return (req, res, next) => {
    console.log(`\n🚀 [ROUTE] Iniciando upload FIELDS para:`, fields.map(f => f.name).join(', '));
    console.log('📋 [ROUTE] Headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });
    
    const uploadMiddleware = upload.fields(fields);
    
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error(`\n💥 [ROUTE] Error capturado en uploadFieldsWrapper:`, err);
        return handleMulterError(err, req, res, next);
      }
      
      console.log(`✅ [ROUTE] Upload FIELDS completado`);
      if (req.files) {
        console.log('📁 [ROUTE] Archivos procesados:', Object.keys(req.files));
        Object.keys(req.files).forEach(key => {
          req.files[key].forEach(file => {
            console.log(`   - ${key}:`, {
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              path: file.path
            });
          });
        });
      } else {
        console.log('ℹ️ [ROUTE] No se recibieron archivos');
      }
      
      next();
    });
  };
};

// ============= CRUD DE CURSOS COMPLETOS =============

// Obtener todos los cursos (público)
router.get('/', courseController.obtenerCursos);

// Obtener curso por id (público)
router.get('/:id', courseController.obtenerCurso);

// Crear curso (solo admin/superadmin) - con soporte para subir imagen
router.post('/', autenticar, soloAdmin, uploadSingleWrapper('image'), courseController.crearCurso);

// Actualizar curso por id (solo admin/superadmin) - con soporte para actualizar imagen
router.put('/:id', autenticar, soloAdmin, uploadSingleWrapper('image'), courseController.actualizarCurso);

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
router.post('/:id/temas/:temaId/materiales', autenticar, soloAdmin, uploadFieldsWrapper([{ name: 'archivo', maxCount: 1 }, { name: 'archivoEn', maxCount: 1 }]), courseController.agregarMaterial);

// Eliminar un material de un tema (solo admin)
router.delete('/:id/temas/:temaId/materiales/:materialId', autenticar, soloAdmin, courseController.eliminarMaterial);

// ============= RUTAS PARA ACTIVIDADES OPTATIVAS =============

// Agregar actividad optativa a un tema (solo admin, con soporte para subir archivos)
router.post('/:id/temas/:temaId/actividades-optativas', autenticar, soloAdmin, uploadSingleWrapper('archivo'), courseController.agregarActividadOptativa);

// Eliminar una actividad optativa de un tema (solo admin)
router.delete('/:id/temas/:temaId/actividades-optativas/:actividadId', autenticar, soloAdmin, courseController.eliminarActividadOptativa);

export default router;
