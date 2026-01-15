import express from 'express';
import configureExpress from './loaders/express.js';

// Crear aplicación Express
const app = express();

// Middleware de logging para debug
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Configurar Express usando el loader
configureExpress(app);

export default app;