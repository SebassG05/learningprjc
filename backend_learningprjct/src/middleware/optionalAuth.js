import { verifyToken } from '../config/jwt.js';

// Como authenticateJWT, pero sin exigir sesión: si llega un token válido deja req.user; si no, sigue
// como anónimo. Sirve para personalizar respuestas públicas (p. ej. marcar las reseñas propias).
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(authHeader.split(' ')[1]);
    } catch {
      // Token caducado o inválido: se trata como anónimo
    }
  }
  next();
};
