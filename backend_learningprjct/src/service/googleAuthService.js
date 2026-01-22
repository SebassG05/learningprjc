// Servicio para la verificación y manejo de usuarios con Google OAuth
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

export async function findOrCreateGoogleUser(googlePayload) {
  const { email, name, sub: googleId, picture } = googlePayload;
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({
      name: name || 'Google User',
      email,
      password: googleId, // Opcional: puedes dejarlo vacío o usar googleId
      avatar: picture,
      provider: 'google',
    });
    await user.save();
  }
  return user;
}

export function generateJWT(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: '7d' }
  );
}
