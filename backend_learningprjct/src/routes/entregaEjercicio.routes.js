import { Router } from 'express';
import multer from 'multer';
import {
  obtenerEntregaUsuario,
  entregarEjercicio,
  obtenerEntregasUsuarioCurso,
  eliminarEntrega,
  obtenerTodasLasEntregas,
  corregirEntrega,
  servirArchivoEntrega
} from '../controller/entregaEjercicioController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { autenticar, soloAdmin } from '../middleware/authorization.js';
import { courseIdFromEjercicio, courseIdFromEntrega, fromParam, requireCourseAccess } from '../middleware/courseAccess.js';

const router = Router();

// Configurar multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});

// Rutas protegidas (requieren autenticación)
// Entregar y borrar entregas exige acceso completo ('write'): en solo lectura no se entrega.
// El acceso se comprueba antes de multer para no recibir el archivo de quien no puede entregar.
router.get('/ejercicio/:ejercicioId/usuario', authenticateJWT, requireCourseAccess('read', courseIdFromEjercicio()), obtenerEntregaUsuario);
router.post('/ejercicio/:ejercicioId', authenticateJWT, requireCourseAccess('write', courseIdFromEjercicio()), upload.single('archivoPdf'), entregarEjercicio);
router.get('/curso/:cursoId/usuario', authenticateJWT, requireCourseAccess('read', fromParam('cursoId')), obtenerEntregasUsuarioCurso);
// PDF de una entrega: su autor (con acceso al curso) o un admin
router.get('/:entregaId/archivo', autenticar, servirArchivoEntrega);
router.delete('/:entregaId', authenticateJWT, requireCourseAccess('write', courseIdFromEntrega()), eliminarEntrega);

// Rutas de administración (requieren rol admin o superadmin)
router.get('/admin/todas', autenticar, soloAdmin, obtenerTodasLasEntregas);
router.put('/:id/corregir', autenticar, soloAdmin, corregirEntrega);

export default router;
