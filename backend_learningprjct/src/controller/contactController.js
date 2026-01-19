import { sendContactEmail } from '../service/mailService.js';

export const contactFormHandler = async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }
    await sendContactEmail({ name, email, phone, company, subject, message });
    return res.status(200).json({ message: '¡Mensaje enviado correctamente!' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al enviar el mensaje.' });
  }
};
