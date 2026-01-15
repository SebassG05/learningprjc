import mongoose from 'mongoose';
import config from '../config.js';

const connectDB = async () => {
    try {
        // Configuraciones para mejor rendimiento (compatible con Mongoose 8.x)
        mongoose.set('bufferCommands', false);
        
        const conn = await mongoose.connect(config.mongoURI, {
            serverSelectionTimeoutMS: 30000, // 30 segundos para selección de servidor
            socketTimeoutMS: 45000, // 45 segundos para operaciones de socket
            maxPoolSize: 10, // Máximo 10 conexiones en el pool
            minPoolSize: 1, // Mínimo 1 conexión
            maxIdleTimeMS: 30000, // Cerrar conexiones inactivas después de 30s
        });
        console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ Error conectando a MongoDB: ${error.message}`);
        throw error;
    }
};

export default connectDB;