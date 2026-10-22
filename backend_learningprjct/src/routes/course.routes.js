import express from 'express';
import Course from '../models/Course.js';
import upload, { handleMulterError } from '../middleware/upload.js';
import * as courseController from '../controller/courseController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { autenticar, soloAdmin } from '../middleware/authorization.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { obtenerVideoCurso } from '../controller/courseVideoController.js';
import { servirMaterial } from '../controller/materialController.js';
import { cambiarModoAcceso } from '../controller/cohortAdminController.js';
import { apuntarInteresado, listarInteresados } from '../controller/courseInterestController.js';
import createRateLimit from '../middleware/rateLimit.js';

// Formulario público: pocas altas por IP y hora
const interestRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Ya nos has dejado varios emails. Prueba de nuevo más tarde.',
});
import { fromParam, requireCourseAccess } from '../middleware/courseAccess.js';

const router = express.Router();

// Wrapper para capturar errores de upload (single file)
const uploadSingleWrapper = (fieldName) => {
  return async (req, res, next) => {
    console.log(`\n🚀 [ROUTE] Iniciando upload SINGLE para campo: ${fieldName}`);
    console.log('📋 [ROUTE] Headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });

    try {
      await new Promise((resolve, reject) => {
        const uploadMiddleware = upload.single(fieldName);
        uploadMiddleware(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

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
    } catch (err) {
      console.error(`\n💥 [ROUTE] Error capturado en uploadSingleWrapper:`, err);
      handleMulterError(err, req, res, next);
    }
  };
};

// Wrapper para capturar errores de upload (multiple fields)
const uploadFieldsWrapper = (fields) => {
  return async (req, res, next) => {
    console.log(`\n🚀 [ROUTE] Iniciando upload FIELDS para:`, fields.map(f => f.name).join(', '));
    console.log('📋 [ROUTE] Headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });

    try {
      await new Promise((resolve, reject) => {
        const uploadMiddleware = upload.fields(fields);
        uploadMiddleware(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

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
    } catch (err) {
      console.error(`\n💥 [ROUTE] Error capturado en uploadFieldsWrapper:`, err);
      handleMulterError(err, req, res, next);
    }
  };
};

// ============= CRUD DE CURSOS COMPLETOS =============

// Obtener todos los cursos (público)
router.get('/', optionalAuth, courseController.obtenerCursos);

// Áreas y niveles del catálogo (público). Va antes de '/:id' para que «areas» no se lea como id
router.get('/areas', courseController.obtenerCatalogo);

// Obtener curso por id (público)
router.get('/:id', optionalAuth, courseController.obtenerCurso);

// Vídeo del curso: preview o completo según la inscripción de quien lo pide (público, personalizado)
router.get('/:id/video', optionalAuth, obtenerVideoCurso);

// Material o actividad de un tema, servido por el backend tras comprobar el acceso
router.get('/:id/materiales/:materialId', optionalAuth, requireCourseAccess('read', fromParam('id')), servirMaterial);

// Crear curso (solo admin/superadmin) - con portada y foto del profesor opcionales
router.post('/', autenticar, soloAdmin, uploadFieldsWrapper([{ name: 'image', maxCount: 1 }, { name: 'profesorFoto', maxCount: 1 }]), courseController.crearCurso);

// Actualizar curso por id (solo admin/superadmin) - con portada y foto del profesor opcionales
router.put('/:id', autenticar, soloAdmin, uploadFieldsWrapper([{ name: 'image', maxCount: 1 }, { name: 'profesorFoto', maxCount: 1 }]), courseController.actualizarCurso);

// Eliminar curso (solo admin/superadmin)
router.delete('/:id', autenticar, soloAdmin, courseController.eliminarCurso);

// Abrir / cerrar curso (admin)
router.put('/:id/toggle-open', autenticar, soloAdmin, courseController.toggleCourseOpen);

// «Avísame de la próxima edición» (cursos privados) y su listado para el admin
router.post('/:id/interes', interestRateLimit, optionalAuth, express.json(), apuntarInteresado);
router.get('/:id/interes', autenticar, soloAdmin, listarInteresados);

// Público o privado (por cohortes)
router.put('/:id/access', autenticar, soloAdmin, express.json(), cambiarModoAcceso);

// ============= RUTAS PARA TEMAS =============

// Agregar un tema al curso (solo admin)
router.post('/:id/temas', autenticar, soloAdmin, courseController.agregarTema);

// Reordenar los temas (solo admin). Va antes de '/:id/temas/:temaId' para que «orden» no se lea como id
router.put('/:id/temas/orden', autenticar, soloAdmin, express.json(), courseController.reordenarTemas);

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
