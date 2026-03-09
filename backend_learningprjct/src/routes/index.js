import express from 'express';
import userRoutes from './user.routes.js';
import reviewRoutes from './review.routes.js';
import contactRoutes from './contact.routes.js';
import courseRoutes from './course.routes.js';
import testRoutes from './test.routes.js';
import { proxyPdf } from '../controller/pdfProxyController.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/user', userRoutes);
router.use('/contact', contactRoutes);
router.use('/courses', courseRoutes);
router.use('/tests', testRoutes);

// Ruta proxy para PDFs de Cloudinary
router.get('/pdf-proxy', proxyPdf);

router.get('/', (req, res) => {
  res.json({ message: 'API rutas funcionando correctamente' });
});

export default router;
