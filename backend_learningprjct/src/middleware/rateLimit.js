// Límite sencillo de peticiones, en memoria y por IP (sin dependencias).
// Frena bots y envíos repetidos; con varias instancias del servidor cada una lleva su propia cuenta.

import { clientIp } from '../utils/requestInfo.js';

export default function createRateLimit({ windowMs, max, message }) {
  const hits = new Map();

  // Limpieza periódica para que el mapa no crezca sin fin
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) if (entry.resetAt <= now) hits.delete(ip);
  }, windowMs).unref();

  return function rateLimit(req, res, next) {
    const now = Date.now();
    const ip = clientIp(req);
    const entry = hits.get(ip);

    if (!entry || entry.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: message });
    }

    entry.count += 1;
    return next();
  };
}
