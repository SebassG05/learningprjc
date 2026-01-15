import express from 'express';
import userRoutes from './user.routes.js';

const router = express.Router();

router.use('/users', userRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'API rutas funcionando correctamente' });
});

export default router;
