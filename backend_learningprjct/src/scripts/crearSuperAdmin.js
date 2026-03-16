import { config } from 'dotenv';
import { connect, disconnect } from 'mongoose';
import User from '../models/User.js';
import readline from 'readline';

config();

// Configuración del superadmin
const SUPERADMIN_CONFIG = {
  email: 'campusevenor@gmail.com',
  name: 'Campus Evenor - Administrador',
  password: 'campus123@',
  role: 'superadmin'
};

// Interfaz para confirmación del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const preguntarConfirmacion = (pregunta) => {
  return new Promise((resolve) => {
    rl.question(pregunta, (respuesta) => {
      resolve(respuesta.toLowerCase() === 's' || respuesta.toLowerCase() === 'si' || respuesta.toLowerCase() === 'yes');
    });
  });
};

const crearSuperAdmin = async () => {
  try {
    // Conexión a MongoDB
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learningDB');
    console.log('✓ Conectado a MongoDB\n');

    // Verificar si ya existe un usuario con ese email
    const usuarioExistente = await User.findOne({ email: SUPERADMIN_CONFIG.email });

    if (usuarioExistente) {
      console.log('⚠️  ATENCIÓN: Ya existe un usuario con el email:', SUPERADMIN_CONFIG.email);
      console.log('   Rol actual:', usuarioExistente.role);
      console.log('   Nombre:', usuarioExistente.name);
      console.log('   Activo:', usuarioExistente.activo ? 'Sí' : 'No');
      console.log('   Fecha de creación:', usuarioExistente.createdAt.toLocaleString());
      console.log();

      if (usuarioExistente.role === 'superadmin') {
        console.log('✓ El usuario ya es superadmin. No se requiere acción.\n');
        
        const actualizarPassword = await preguntarConfirmacion(
          '¿Deseas actualizar la contraseña del superadmin existente? (s/n): '
        );

        if (actualizarPassword) {
          usuarioExistente.password = SUPERADMIN_CONFIG.password;
          usuarioExistente.activo = true;
          await usuarioExistente.save();
          console.log('\n✓ Contraseña del superadmin actualizada correctamente');
        } else {
          console.log('\n⊘ No se realizaron cambios');
        }
      } else {
        const promoverASuperadmin = await preguntarConfirmacion(
          `¿Deseas promover este usuario (${usuarioExistente.role}) a SUPERADMIN? (s/n): `
        );

        if (promoverASuperadmin) {
          usuarioExistente.role = 'superadmin';
          usuarioExistente.password = SUPERADMIN_CONFIG.password;
          usuarioExistente.activo = true;
          await usuarioExistente.save();
          console.log('\n✓ Usuario promovido a SUPERADMIN correctamente');
          console.log('✓ Contraseña actualizada');
        } else {
          console.log('\n⊘ No se realizaron cambios');
        }
      }
    } else {
      // No existe, crear nuevo superadmin
      console.log('📋 Creando nuevo SUPERADMIN...\n');
      console.log('   Email:', SUPERADMIN_CONFIG.email);
      console.log('   Nombre:', SUPERADMIN_CONFIG.name);
      console.log('   Rol: SUPERADMIN');
      console.log();

      const confirmar = await preguntarConfirmacion('¿Confirmas la creación del superadmin? (s/n): ');

      if (confirmar) {
        const superadmin = await User.crearSuperAdmin({
          email: SUPERADMIN_CONFIG.email,
          name: SUPERADMIN_CONFIG.name,
          password: SUPERADMIN_CONFIG.password
        });

        console.log('\n✅ SUPERADMIN CREADO EXITOSAMENTE\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', superadmin.email);
        console.log('👤 Nombre:', superadmin.name);
        console.log('🔑 Contraseña:', SUPERADMIN_CONFIG.password);
        console.log('🛡️  Rol:', superadmin.role);
        console.log('🆔 ID:', superadmin._id);
        console.log('📅 Creado:', superadmin.createdAt.toLocaleString());
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro');
        console.log('⚠️  RECOMENDACIÓN: Cambia la contraseña después del primer login\n');
      } else {
        console.log('\n⊘ Operación cancelada por el usuario');
      }
    }

    rl.close();
    await disconnect();
    console.log('\n✓ Desconectado de MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR al crear/actualizar superadmin:', error.message);
    
    if (error.code === 11000) {
      console.error('   Causa: Email duplicado en la base de datos');
    } else {
      console.error('   Detalles:', error);
    }

    rl.close();
    await disconnect();
    process.exit(1);
  }
};

// Ejecutar el script
console.log('\n┌─────────────────────────────────────────────────┐');
console.log('│   CREACIÓN/ACTUALIZACIÓN DE SUPERADMINISTRADOR │');
console.log('│   Campus Evenor - Learning Platform            │');
console.log('└─────────────────────────────────────────────────┘\n');

crearSuperAdmin();
