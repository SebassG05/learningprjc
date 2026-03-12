import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from '../routes/index.js';
import { errorHandler, notFound } from '../middleware/errorHandler.js';

/**
 * Configuración de Express
 */
const configureExpress = (app) => {
    // Middlewares básicos
    app.use(cors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                'http://localhost:5175',
                'http://localhost:5173',
                'http://localhost:8547', // Permitir peticiones desde el mismo servidor (para upload-material.html)
                'https://learningprjc.vercel.app', // Frontend en Vercel
                'https://learningprjc-2.onrender.com', // Backend en Render (para HTML uploads)
                'https://campus.evenor-tech.com', // Dominio de producción en Cloudflare
            ];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Servir archivos estáticos desde la carpeta 'public'
    app.use(express.static('public'));

    // Logger solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    // Rutas principales
    app.use('/api', routes);

    // Manejo de rutas no encontradas
    app.use(notFound);

    // Middleware de manejo de errores (debe ir al final)
    app.use(errorHandler);
};

export default configureExpress;