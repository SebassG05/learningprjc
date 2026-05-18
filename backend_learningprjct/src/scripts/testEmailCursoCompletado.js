/**
 * Script de prueba para verificar los correos de curso completado.
 * Uso: node src/scripts/testEmailCursoCompletado.js <email> <nombre>
 * Ejemplo: node src/scripts/testEmailCursoCompletado.js tu@email.com "Tu Nombre"
 */

import dotenv from 'dotenv';
import { sendCourseCompletionEmailToUser, sendCourseCompletionNotificationToAdmin } from '../service/mailService.js';

dotenv.config();

const userEmail = process.argv[2] || process.env.EMAIL_USER;
const userName  = process.argv[3] || 'Usuario de Prueba';
const courseName = 'ANFORA: Gestión de la Huella Hídrica';

if (!userEmail) {
  console.error('❌ Indica un email: node src/scripts/testEmailCursoCompletado.js tu@email.com "Tu Nombre"');
  process.exit(1);
}

console.log(`\nEnviando correos de prueba...`);
console.log(`  Usuario : ${userName} <${userEmail}>`);
console.log(`  Curso   : ${courseName}\n`);

try {
  await sendCourseCompletionEmailToUser(userName, userEmail, courseName);
  console.log(`✅ Correo al usuario enviado → ${userEmail}`);

  await sendCourseCompletionNotificationToAdmin(userName, userEmail, courseName);
  console.log(`✅ Notificación admin enviada → info@evenor-tech.com, s.gandia@evenor-tech.com, campusevenor@gmail.com`);

  console.log('\n✓ Prueba completada. Revisa las bandejas de entrada.');
} catch (error) {
  console.error('❌ Error al enviar:', error.message);
  process.exit(1);
}
