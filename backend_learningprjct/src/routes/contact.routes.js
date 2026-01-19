import express from 'express';
import { contactFormHandler } from '../controller/contactController.js';

const router = express.Router();

router.post('/', contactFormHandler);

export default router;
