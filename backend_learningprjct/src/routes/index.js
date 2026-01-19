import express from 'express';
import userRoutes from './user.routes.js';
import reviewRoutes from './review.routes.js';
import contactRoutes from './contact.routes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/user', userRoutes);
router.use('/contact', contactRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'API rutas funcionando correctamente' });
});

export default router;
