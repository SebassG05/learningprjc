import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const verificarUsuario = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener email y password de argumentos de línea de comandos
    const email = process.argv[2] || 'sebas@gmail.com';
    const password = process.argv[3] || 'Sebas205@';
    
    const User = mongoose.connection.db.collection('users');
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('❌ ERROR: El usuario no existe en la base de datos\n');
      console.log('📝 Creando usuario de prueba...\n');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        name: 'Sebastián',
        email: email,
        password: hashedPassword,
        createdAt: new Date()
      };
      
      const result = await User.insertOne(newUser);
      console.log('✅ Usuario creado exitosamente!');
      console.log('   Email:', email);
      console.log('   Password:', password);
      console.log('   ID:', result.insertedId, '\n');
      console.log('🎯 Ahora puedes hacer login con estas credenciales\n');
    } else {
      console.log('✅ Usuario encontrado en la base de datos');
      console.log('   ID:', user._id);
      console.log('   Nombre:', user.name);
      console.log('   Email:', user.email);
      console.log('   Creado:', user.createdAt, '\n');
      
      console.log('🔐 Verificando contraseña...');
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (isMatch) {
        console.log('✅ La contraseña es CORRECTA');
        console.log('✅ El login debería funcionar\n');
        console.log('🤔 Si aún te da error 401, verifica:');
        console.log('   - Que el servidor backend esté corriendo');
        console.log('   - Que la URL sea: http://localhost:3007/api/users/login');
        console.log('   - Que estés enviando Content-Type: application/json\n');
      } else {
        console.log('❌ ERROR: La contraseña NO coincide');
        console.log('   La contraseña en la BD es diferente a "Sebas205@"\n');
        console.log('🔧 ¿Quieres actualizar la contraseña? (s/n)');
        console.log('   Si sí, ejecuta: npm run fix-password', user.email, '\n');
        
        // Actualizar la contraseña automáticamente
        console.log('🔄 Actualizando contraseña...');
        const newHashedPassword = await bcrypt.hash(password, 10);
        await User.updateOne(
          { _id: user._id },
          { $set: { password: newHashedPassword } }
        );
        console.log('✅ Contraseña actualizada exitosamente');
        console.log('🎯 Ahora puedes hacer login con: ' + password + '\n');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
    process.exit(0);
  }
};

console.log('═══════════════════════════════════════════════');
console.log('🔍 VERIFICAR CREDENCIALES DE USUARIO');
console.log('═══════════════════════════════════════════════\n');

verificarUsuario().catch(console.error);
