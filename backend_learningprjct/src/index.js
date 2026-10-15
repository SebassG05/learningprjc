import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import { assertJwtConfig } from './config/jwt.js';

dotenv.config();

// Sin un JWT_SECRET válido no se arranca: firmar con una clave conocida permitiría fabricar sesiones
try {
  assertJwtConfig();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const PORT = process.env.PORT || 8547;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learningprjct';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });
