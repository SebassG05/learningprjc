import express from 'express';
import * as testController from '../controller/testController.js';

const router = express.Router();

router.get('/:cursoId/temas/:temaId/test', testController.obtenerTestPorTema);

router.post('/:cursoId/temas/:temaId/test/validar', testController.validarRespuestas);

router.post('/test', testController.crearTest);

export default router;
