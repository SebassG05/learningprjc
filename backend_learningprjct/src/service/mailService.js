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

export const sendCourseCompletionEmailToUser = async (userName, userEmail, courseName = 'el curso') => {
  const mailOptions = {
    from: `Campus Evenor <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🎓 ¡Enhorabuena, ${userName}! Has completado el curso`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f4f6f8; padding: 40px 16px;">
        <div style="max-width: 580px; margin: auto;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1a2e1a 0%, #1e3a1e 100%); border-radius: 14px 14px 0 0; padding: 36px; text-align: center;">
            <div style="display: inline-block; background: rgba(161,219,135,0.15); border: 2px solid #a1db87; border-radius: 50%; width: 70px; height: 70px; line-height: 70px; font-size: 36px; margin-bottom: 20px;">🎓</div>
            <h1 style="color: #ffffff; margin: 0 0 8px; font-size: 24px; letter-spacing: -0.3px;">¡Enhorabuena, ${userName}!</h1>
            <p style="color: #7ec87e; margin: 0; font-size: 15px;">Has completado exitosamente el curso</p>
          </div>

          <!-- Body -->
          <div style="background: #ffffff; border-radius: 0 0 14px 14px; padding: 36px; border: 1px solid #e2e8f0; border-top: none;">

            <!-- Curso -->
            <div style="background: #f6faf2; border: 1px solid #c6e8ac; border-left: 4px solid #5aa833; border-radius: 8px; padding: 18px 20px; margin-bottom: 28px;">
              <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #5aa833;">Curso completado</p>
              <p style="margin: 0; color: #1a2e1a; font-size: 16px; font-weight: 700;">${courseName}</p>
            </div>

            <!-- Mensaje -->
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
              Tu esfuerzo y dedicación a lo largo de todo el programa han dado sus frutos.
              Has superado todos los módulos y el test final de certificación.
            </p>

            <!-- Certificado -->
            <div style="background: #fffbeb; border: 1px solid #fcd34d; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 18px 20px; margin-bottom: 28px;">
              <p style="margin: 0 0 6px; font-weight: 700; color: #92400e; font-size: 14px;">📜 Tu certificado está en camino</p>
              <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.6;">
                Nuestro equipo está preparando el certificado oficial que acredita tu formación en
                <strong>"${courseName}"</strong>. Lo recibirás en los próximos días en este mismo correo.
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${process.env.FRONTEND_URL || 'https://campus.evenor-tech.com'}"
                 style="display: inline-block; background: #5aa833; color: #ffffff; text-decoration: none; font-weight: 700; padding: 14px 36px; border-radius: 8px; font-size: 15px; letter-spacing: 0.2px;">
                Ir al Campus →
              </a>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">Campus Evenor &copy; ${new Date().getFullYear()} · Si tienes alguna duda, contáctanos en <a href="mailto:campusevenor@gmail.com" style="color: #5aa833; text-decoration: none;">campusevenor@gmail.com</a></p>
            </div>
          </div>

        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

export const sendCourseCompletionNotificationToAdmin = async (userName, userEmail, courseName = 'el curso') => {
  const fechaFormateada = new Date().toLocaleString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const mailOptions = {
    from: `Campus Evenor <${process.env.EMAIL_USER}>`,
    to: ['s.gandia@evenor-tech.com', 'campusevenor@gmail.com'],
    subject: `🎓 Nuevo certificado pendiente — ${userName}`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f4f6f8; padding: 40px 16px;">
        <div style="max-width: 580px; margin: auto;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1a2e1a 0%, #1e3a1e 100%); border-radius: 14px 14px 0 0; padding: 32px 36px; text-align: center;">
            <div style="display: inline-block; background: rgba(161,219,135,0.15); border: 2px solid #a1db87; border-radius: 50%; width: 70px; height: 70px; line-height: 70px; font-size: 36px; margin-bottom: 16px;">🎓</div>
            <h1 style="color: #ffffff; margin: 0 0 6px; font-size: 22px; letter-spacing: -0.3px;">Certificado pendiente de emisión</h1>
            <p style="color: #7ec87e; margin: 0; font-size: 14px;">Un estudiante ha superado el test final de certificación</p>
          </div>

          <!-- Body -->
          <div style="background: #ffffff; border-radius: 0 0 14px 14px; padding: 36px; border: 1px solid #e2e8f0; border-top: none;">

            <!-- Datos del estudiante -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
              <tr>
                <td colspan="2" style="padding-bottom: 14px;">
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #5aa833;">Datos del estudiante</span>
                </td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 38%; font-weight: 600;">Nombre</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 700;">${userName}</td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Email</td>
                <td style="padding: 12px 0; font-size: 14px;">
                  <a href="mailto:${userEmail}" style="color: #5aa833; text-decoration: none; font-weight: 600;">${userEmail}</a>
                </td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Curso</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px;">${courseName}</td>
              </tr>
              <tr style="border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Fecha y hora</td>
                <td style="padding: 12px 0; color: #111827; font-size: 14px;">${fechaFormateada}</td>
              </tr>
            </table>

            <!-- Acción requerida -->
            <div style="background: #fffbeb; border: 1px solid #fcd34d; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 18px 20px; margin-bottom: 28px;">
              <p style="margin: 0 0 6px; font-weight: 700; color: #92400e; font-size: 14px;">⚠️ Acción requerida</p>
              <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.6;">
                Prepara y envía el <strong>certificado oficial de finalización</strong> al estudiante a la mayor brevedad posible.
                Responde a este correo o escribe directamente a
                <a href="mailto:${userEmail}" style="color: #92400e; font-weight: 600;">${userEmail}</a>.
              </p>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">Notificación automática · Campus Evenor &copy; ${new Date().getFullYear()}</p>
            </div>
          </div>

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