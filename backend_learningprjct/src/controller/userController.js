import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { sendPasswordResetEmail } from '../service/mailService.js';

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado correctamente', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};

export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};

export const logoutUser = async (req, res) => {
  // El logout en JWT se realiza eliminando el token en el frontend.
  // Para mantener la misma estructura que login, respondemos con un mensaje y el usuario (si lo deseas, puedes enviar el usuario desde el token).
  res.json({
    message: 'Sesión cerrada correctamente'
  });
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // No revelar si el email existe o no
      return res.status(200).json({ message: 'Si el email está registrado, se enviará un correo con instrucciones.' });
    }
    // Eliminar tokens previos
    await PasswordResetToken.deleteMany({ userId: user._id });
    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
    await PasswordResetToken.create({ userId: user._id, token, expiresAt });
    // Aquí se debe enviar el email con el enlace (pendiente)
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${user._id}`;
    await sendPasswordResetEmail(user.email, resetLink);
    return res.status(200).json({ message: 'Si el email está registrado, se enviará un correo con instrucciones.' });
  } catch (err) {
    return res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token, newPassword } = req.body;
  console.log('resetPassword body:', { userId, token, newPassword });
  if (!userId || !token || !newPassword) {
    console.error('Datos incompletos:', { userId, token, newPassword });
    return res.status(400).json({ error: 'Datos incompletos.' });
  }
  try {
    const resetToken = await PasswordResetToken.findOne({ userId, token });
    console.log('resetToken encontrado:', resetToken);
    if (!resetToken || resetToken.expiresAt < new Date()) {
      console.error('Token inválido o expirado:', resetToken);
      return res.status(400).json({ error: 'Token inválido o expirado.' });
    }
    const user = await User.findById(userId);
    console.log('Usuario encontrado:', user);
    if (!user) {
      console.error('Usuario no encontrado:', userId);
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await PasswordResetToken.deleteMany({ userId });
    console.log('Contraseña actualizada y tokens eliminados');
    return res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error('Error en resetPassword:', err);
    return res.status(500).json({ error: 'Error en el servidor', details: err.message });
  }
};
