import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from '../models/Test.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';

dotenv.config();

const verificarConfiguracionTestFinal = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB\n');

    const titulo = 'Modelización de la Dinámica del Carbono Orgánico del Suelo';
    const curso = await Course.findOne({ title: titulo });
    
    if (!curso) {
      console.log('❌ Curso no encontrado');
      process.exit(1);
    }

    console.log('📚 Curso: ' + curso.title);
    console.log(`   ID: ${curso._id}\n`);

    // Buscar test final
    const testFinal = await Test.findOne({ 
      cursoId: curso._id.toString(),
      temaId: 'test-final-certificacion'
    });

    if (!testFinal) {
      console.log('❌ Test Final NO encontrado');
      console.log('   Buscando test final con temaId: test-final-certificacion');
      process.exit(1);
    }

    console.log('✅ Test Final configurado correctamente:');
    console.log(`   ID: ${testFinal._id}`);
    console.log(`   Título: ${testFinal.titulo}`);
    console.log(`   TemaId: ${testFinal.temaId}`);
    console.log(`   Preguntas: ${testFinal.preguntas.length}`);
    console.log(`   Duración: ${testFinal.duracionMinutos} minutos`);
    console.log(`   Nota mínima: ${testFinal.notaMinima}%\n`);

    // Verificar variables de entorno para email
    console.log('📧 Configuración de Email:');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || '❌ NO CONFIGURADO'}`);
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
    console.log(`   EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'gmail (por defecto)'}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || '❌ NO CONFIGURADO'}\n`);

    // Verificar que hay usuarios inscritos
    const enrollments = await UserProgress.find({ courseId: curso._id });
    console.log(`👥 Usuarios inscritos: ${enrollments.length}`);
    
    if (enrollments.length > 0) {
      console.log('\n📝 Primeros 3 usuarios inscritos:');
      for (let i = 0; i < Math.min(3, enrollments.length); i++) {
        const user = await User.findById(enrollments[i].userId);
        if (user) {
          console.log(`   ${i + 1}. ${user.name} (${user.email})`);
          console.log(`      Tests completados: ${enrollments[i].completedTests?.length || 0}`);
        }
      }
    }

    console.log('\n' + '═'.repeat(70));
    console.log('✅ CONFIGURACIÓN VERIFICADA');
    console.log('═'.repeat(70));
    console.log('\n💡 Para probar el envío de emails:');
    console.log('   1. Completa los tests de los temas 1-4');
    console.log('   2. Accede al Test Final de Certificación');
    console.log('   3. Completa el test con nota ≥ 70%');
    console.log('   4. El sistema enviará automáticamente:');
    console.log('      • Email al estudiante confirmando la finalización');
    console.log('      • Email a info@evenor-tech.com notificando');
    console.log('      • Email a campusevenor@gmail.com notificando\n');

    await mongoose.connection.close();
    console.log('✓ Conexión cerrada');  
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verificarConfiguracionTestFinal();
