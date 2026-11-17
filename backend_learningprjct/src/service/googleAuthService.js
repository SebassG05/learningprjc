// Servicio para la verificación y manejo de usuarios con Google OAuth
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { signToken } from '../config/jwt.js';
import { normalizeEmail } from '../utils/email.js';
import { randomPassword } from '../utils/passwordPolicy.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

export class GoogleAuthError extends Error {
  constructor(message) {
    super(message);
    this.status = 401;
  }
}

/**
 * Busca la cuenta por correo o la crea. Solo con el correo verificado por Google: si no, cualquiera con una
 * cuenta de Google con un correo ajeno entraría en la cuenta de ese correo.
 * La primera vez que una cuenta entra con Google su contraseña pasa a ser aleatoria: deja fuera a quien se
 * hubiera registrado antes con ese correo y anula las cuentas antiguas que tenían el `sub` como contraseña.
 */
export async function findOrCreateGoogleUser(googlePayload) {
  if (googlePayload?.email_verified !== true) {
    throw new GoogleAuthError('Tu cuenta de Google no tiene el correo verificado.');
  }
  const email = normalizeEmail(googlePayload.email);
  if (!email) throw new GoogleAuthError('Google no ha enviado el correo de la cuenta.');

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ name: googlePayload.name || 'Google User', email, password: randomPassword(), googleLinkedAt: new Date() });
    await user.save();
  } else if (!user.googleLinkedAt) {
    user.password = randomPassword();
    user.googleLinkedAt = new Date();
    await user.save();
  }
  return user;
}

export function generateJWT(user) {
  return signToken({ id: user._id, email: user.email });
}
