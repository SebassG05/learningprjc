import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '[OK]' : '[MISSING]');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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