import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const resetTestFinal = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener email del argumento o usar uno por defecto
    const userEmail = process.argv[2];
    
    if (!userEmail) {
      console.log('❌ ERROR: Debes proporcionar un email como argumento');
      console.log('📝 Uso: npm run reset-test email@ejemplo.com\n');
      process.exit(1);
    }
    
    console.log(`📧 Buscando usuario: ${userEmail}`);
    
    const User = mongoose.connection.db.collection('users');
    const UserProgress = mongoose.connection.db.collection('userprogresses');
    
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }
    
    console.log(`✅ Usuario encontrado: ${user.name} (${user.email})\n`);
    
    const courseId = new mongoose.Types.ObjectId('69a6a0a4c8289d012745af63');
    
    // Obtener el curso para encontrar el último tema (test final)
    const Course = mongoose.connection.db.collection('courses');
    const course = await Course.findOne({ _id: courseId });
    
    if (!course || !course.temas || course.temas.length === 0) {
      console.log('❌ No se pudo encontrar el curso o no tiene temas\n');
      process.exit(1);
    }
    
    // Encontrar el último tema del curso
    const maxNumeroTema = Math.max(...course.temas.map(t => t.numeroTema || 0));
    const ultimoTema = course.temas.find(t => t.numeroTema === maxNumeroTema);
    const testFinalId = ultimoTema._id.toString();
    
    console.log(`🎓 Test final detectado: Tema ${ultimoTema.numeroTema} - ${ultimoTema.titulo}`);
    console.log(`   ID: ${testFinalId}\n`);
    
    console.log('🔄 Reseteando test final...');
    
    const result = await UserProgress.updateOne(
      { 
        userId: user._id,
        courseId: courseId
      },
      { 
        $pull: { completedTests: testFinalId }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Test final reseteado exitosamente');
      console.log('📧 Ahora puedes ejecutar la prueba de correos de nuevo\n');
    } else {
      console.log('ℹ️  El test ya estaba sin completar (o el usuario no está inscrito)\n');
    }
    
    // Mostrar estado actual
    const enrollment = await UserProgress.findOne({ 
      userId: user._id,
      courseId: courseId 
    });
    
    if (enrollment) {
      console.log('📊 Estado actual:');
      console.log(`   Tests completados: ${enrollment.completedTests?.length || 0}`);
      console.log(`   Tests: ${enrollment.completedTests?.join(', ') || 'ninguno'}\n`);
    } else {
      console.log('⚠️  El usuario no está inscrito en este curso\n');
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
console.log('🧪 RESETEAR TEST FINAL PARA PRUEBAS DE CORREOS');
console.log('═══════════════════════════════════════════════\n');

resetTestFinal().catch(console.error);
