import express from 'express';
import * as testController from '../controller/testController.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { autenticar, soloAdmin } from '../middleware/authorization.js';
import { fromParam, requireCourseAccess } from '../middleware/courseAccess.js';

const router = express.Router();

// Tests autocorregidos: se pueden hacer también en modo solo lectura ('read')
const readCourse = [optionalAuth, requireCourseAccess('read', fromParam('cursoId'))];

router.get('/:cursoId/temas/:temaId/test', ...readCourse, testController.obtenerTestPorTema);

router.post('/:cursoId/temas/:temaId/test/validar', ...readCourse, testController.validarRespuestas);

router.post('/test', autenticar, soloAdmin, testController.crearTest);

export default router;
