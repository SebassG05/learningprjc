import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Solo log en desarrollo
if (process.env.NODE_ENV !== 'production') {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '[OK]' : '[MISSING]');
}

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendPasswordResetEmail = async (to, resetLink) => {
  const mailOptions = {
    from: `Campus Evenor <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Restablece tu contraseña',
    html: `
      <div style="font-family: 'Rondana', Arial, sans-serif; background: #f0f9ea; padding: 32px; color: #333333;">
        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(161,219,135,0.10); padding: 32px; border: 1px solid #a1db87;">
          <h2 style="color: #5aa833; margin-bottom: 16px; font-family: 'Rondana', Arial, sans-serif;">Restablece tu contraseña</h2>
          <p style="color: #595959;">Hola,</p>
          <p style="color: #595959;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente botón para continuar:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #a1db87; color: #333333; text-decoration: none; font-weight: 600; padding: 12px 32px; border-radius: 6px; font-size: 16px; border: 2px solid #5aa833;">Restablecer contraseña</a>
          </div>
          <p style="color: #595959;">Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña seguirá siendo la misma.</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #a1db87;">
          <p style="font-size: 13px; color: #a1db87; text-align: center; font-family: 'Rondana', Arial, sans-serif;">Campus Evenor &copy; 2026</p>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

export const sendContactEmail = async ({ name, email, phone, company, subject, message }) => {
  const mailOptions = {
    from: `Campus Contacto <${process.env.EMAIL_USER}>`,
    to: 'campusevenor@gmail.com',
    subject: `[Contacto Campus] ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px; color: #333;">
        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(161,219,135,0.10); padding: 32px; border: 1px solid #a1db87;">
          <h2 style="color: #5aa833; margin-bottom: 16px;">Nuevo mensaje de contacto</h2>
          <p><b>Nombre:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Teléfono:</b> ${phone || '-'} </p>
          <p><b>Empresa/Organización:</b> ${company || '-'} </p>
          <p><b>Asunto:</b> ${subject}</p>
          <p><b>Mensaje:</b></p>
          <div style="background: #f0f9ea; border-radius: 6px; padding: 16px; margin-bottom: 16px; color: #222;">${message.replace(/\n/g, '<br>')}</div>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

export const sendCourseCompletionEmailToUser = async (userName, userEmail) => {
  const mailOptions = {
    from: `Campus Evenor <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: '¡Felicidades! Has completado el curso',
    html: `
      <div style="font-family: 'Rondana', Arial, sans-serif; background: #f0f9ea; padding: 32px; color: #333333;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(161,219,135,0.10); padding: 32px; border: 1px solid #a1db87;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #a1db87 0%, #5ec6a6 100%); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="font-size: 40px;">🎓</span>
            </div>
            <h2 style="color: #5aa833; margin-bottom: 8px; font-family: 'Rondana', Arial, sans-serif;">¡Enhorabuena, ${userName}!</h2>
            <p style="color: #595959; font-size: 18px;">Has completado exitosamente el curso</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f0f9ea 0%, #e8f5e0 100%); border-left: 4px solid #a1db87; padding: 20px; border-radius: 6px; margin: 24px 0;">
            <p style="color: #5aa833; font-weight: bold; margin-bottom: 8px;">📜 Tu certificado está en camino</p>
            <p style="color: #595959; margin: 0; line-height: 1.6;">
              Nuestro equipo está preparando tu certificado de finalización del curso de 
              <strong>"Modelización de la dinámica del carbono orgánico del suelo"</strong>. 
              En los próximos días recibirás un correo con el certificado oficial que acredita tus conocimientos.
            </p>
          </div>

          <p style="color: #595959; line-height: 1.6;">
            Gracias por tu dedicación y esfuerzo durante todo el curso. Esperamos que los conocimientos 
            adquiridos te sean de gran utilidad en tu carrera profesional.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://campus.evenor-tech.com'}" 
               style="display: inline-block; background: #a1db87; color: #333333; text-decoration: none; font-weight: 600; padding: 12px 32px; border-radius: 6px; font-size: 16px; border: 2px solid #5aa833;">
              Ir al Campus
            </a>
          </div>

          <p style="color: #595959; font-size: 14px; line-height: 1.6;">
            Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.
          </p>

          <hr style="margin: 32px 0; border: none; border-top: 1px solid #a1db87;">
          <p style="font-size: 13px; color: #a1db87; text-align: center; font-family: 'Rondana', Arial, sans-serif;">
            Campus Evenor &copy; ${new Date().getFullYear()}
          </p>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

export const sendCourseCompletionNotificationToAdmin = async (userName, userEmail) => {
  const mailOptions = {
    from: `Campus Evenor <${process.env.EMAIL_USER}>`,
    to: ['info@evenor-tech.com', 'campusevenor@gmail.com'],
    subject: '✅ Nuevo estudiante ha completado el curso',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px; color: #333;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(161,219,135,0.10); padding: 32px; border: 1px solid #a1db87;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #a1db87 0%, #5ec6a6 100%); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="font-size: 30px;">🎉</span>
            </div>
            <h2 style="color: #5aa833; margin-bottom: 8px;">Curso completado exitosamente</h2>
          </div>
          
          <div style="background: #f0f9ea; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="color: #5aa833; font-weight: bold; margin-bottom: 16px; font-size: 16px;">📊 Detalles del estudiante</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #595959; font-weight: 600; width: 40%;">Nombre:</td>
                <td style="padding: 8px 0; color: #333;">${userName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #595959; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #333;">${userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #595959; font-weight: 600;">Curso:</td>
                <td style="padding: 8px 0; color: #333;">Modelización de la dinámica del carbono orgánico del suelo</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #595959; font-weight: 600;">Fecha de finalización:</td>
                <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</td>
              </tr>
            </table>
          </div>

          <div style="background: linear-gradient(135deg, #fff9e6 0%, #fff4d4 100%); border-left: 4px solid #ffc107; padding: 16px; border-radius: 6px; margin: 24px 0;">
            <p style="color: #856404; margin: 0; display: flex; align-items: center;">
              <span style="font-size: 20px; margin-right: 8px;">⚠️</span>
              <strong>Acción requerida:</strong> Preparar y enviar el certificado de finalización al estudiante.
            </p>
          </div>

          <p style="color: #595959; font-size: 14px; line-height: 1.6; margin-top: 24px;">
            Este estudiante ha completado todos los requisitos del curso, incluyendo el test final de certificación. 
            Por favor, procede a generar y enviar el certificado oficial a la mayor brevedad posible.
          </p>

          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e0e0e0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            Notificación automática generada por Campus Evenor
          </p>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

export const sendExerciseCorrectionEmail = async ({ userName, userEmail, ejercicioTitulo, calificacion, feedbackProfesor, estado }) => {
  const estadoLabel = estado === 'aprobado' ? 'Aprobado' : estado === 'rechazado' ? 'Rechazado' : 'Revisado';
  const estadoColor = estado === 'aprobado' ? '#22c55e' : estado === 'rechazado' ? '#ef4444' : '#eab308';
  const estadoEmoji = estado === 'aprobado' ? '✅' : estado === 'rechazado' ? '❌' : '🔍';

  const mailOptions = {
    from: `Campus Evenor <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `${estadoEmoji} Tu ejercicio "${ejercicioTitulo}" ha sido corregido`,
    html: `
      <div style="font-family: 'Rondana', Arial, sans-serif; background: #f0f9ea; padding: 32px; color: #333333;">
        <div style="max-width: 560px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(161,219,135,0.10); padding: 32px; border: 1px solid #a1db87;">
          
          <div style="text-align: center; margin-bottom: 28px;">
            <span style="font-size: 48px;">${estadoEmoji}</span>
            <h2 style="color: #5aa833; margin: 12px 0 4px; font-family: 'Rondana', Arial, sans-serif;">Ejercicio Corregido</h2>
            <p style="color: #595959; margin: 0;">Hola <strong>${userName}</strong>, tu entrega ha sido evaluada.</p>
          </div>

          <div style="background: #f8fdf5; border-radius: 10px; padding: 20px; margin-bottom: 24px; border: 1px solid #d4edda;">
            <p style="color: #595959; margin: 0 0 8px;"><strong>Ejercicio:</strong> ${ejercicioTitulo}</p>
            <p style="color: #595959; margin: 0 0 8px;"><strong>Estado:</strong> <span style="color: ${estadoColor}; font-weight: bold;">${estadoLabel}</span></p>
            ${calificacion != null ? `
            <div style="text-align: center; margin: 20px 0 12px;">
              <div style="display: inline-block; width: 90px; height: 90px; border-radius: 50%; border: 4px solid ${estadoColor}; background: ${estadoColor}18; padding-top: 18px;">
                <span style="font-size: 32px; font-weight: 900; color: ${estadoColor};">${Number.isInteger(calificacion) ? calificacion : Number(calificacion).toFixed(1)}</span><br>
                <span style="font-size: 12px; color: ${estadoColor}; font-weight: bold;">/10</span>
              </div>
              <p style="color: #595959; margin: 8px 0 0; font-size: 13px;">Calificación obtenida</p>
            </div>` : ''}
          </div>

          ${feedbackProfesor ? `
          <div style="background: #f0f9ea; border-left: 4px solid #a1db87; padding: 16px 20px; border-radius: 6px; margin-bottom: 24px;">
            <p style="color: #5aa833; font-weight: bold; margin: 0 0 8px;">💬 Retroalimentación del profesor</p>
            <p style="color: #595959; margin: 0; line-height: 1.7; white-space: pre-line;">${feedbackProfesor}</p>
          </div>` : ''}

          <div style="text-align: center; margin: 28px 0 0;">
            <a href="${process.env.FRONTEND_URL || 'https://campus.evenor-tech.com'}"
               style="display: inline-block; background: #a1db87; color: #333333; text-decoration: none; font-weight: 600; padding: 12px 32px; border-radius: 6px; font-size: 16px; border: 2px solid #5aa833;">
              Ir al Campus
            </a>
          </div>

          <hr style="margin: 32px 0; border: none; border-top: 1px solid #a1db87;">
          <p style="font-size: 13px; color: #a1db87; text-align: center; font-family: 'Rondana', Arial, sans-serif;">Campus Evenor &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};