import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function verificarRoleUsuario() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const email = 'campusevenor@gmail.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }

    console.log('\n📋 Datos del usuario:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Activo: ${user.activo}`);
    console.log(`   Last Login: ${user.lastLogin}`);

    if (!user.role || user.role === 'usuario') {
      console.log('\n⚠️  El usuario NO tiene role de admin/superadmin');
      console.log('   Actualizando role a "superadmin"...');
      
      user.role = 'superadmin';
      await user.save();
      
      console.log('✅ Role actualizado correctamente');
    } else {
      console.log('\n✅ El usuario YA tiene role:', user.role);
    }

    await mongoose.disconnect();
    console.log('\n✅ Verificación completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verificarRoleUsuario();
