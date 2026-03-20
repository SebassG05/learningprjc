import { Router } from 'express';
import multer from 'multer';
import {
  obtenerEntregaUsuario,
  entregarEjercicio,
  obtenerEntregasUsuarioCurso,
  eliminarEntrega,
  obtenerTodasLasEntregas,
  corregirEntrega
} from '../controller/entregaEjercicioController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { autenticar, soloAdmin } from '../middleware/authorization.js';

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
router.get('/ejercicio/:ejercicioId/usuario', authenticateJWT, obtenerEntregaUsuario);
router.post('/ejercicio/:ejercicioId', authenticateJWT, upload.single('archivoPdf'), entregarEjercicio);
router.get('/curso/:cursoId/usuario', authenticateJWT, obtenerEntregasUsuarioCurso);
router.delete('/:entregaId', authenticateJWT, eliminarEntrega);

// Rutas de administración (requieren rol admin o superadmin)
router.get('/admin/todas', autenticar, soloAdmin, obtenerTodasLasEntregas);
router.put('/:id/corregir', autenticar, soloAdmin, corregirEntrega);

export default router;
