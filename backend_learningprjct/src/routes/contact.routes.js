import express from 'express';
import { contactFormHandler } from '../controller/contactController.js';
import contactRateLimit from '../middleware/contactRateLimit.js';

const router = express.Router();

router.post('/', contactRateLimit, contactFormHandler);

export default router;
