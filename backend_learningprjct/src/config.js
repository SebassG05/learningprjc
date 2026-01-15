import dotenv from 'dotenv';

dotenv.config();

export default {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/base_project',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    // Configuración de email
    email: {
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.MAIL_PORT) || 587,
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASS || ''
    },
    // URLs de la aplicación
    app: {
        baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    },
    // URL del frontend para enlaces en emails
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};
