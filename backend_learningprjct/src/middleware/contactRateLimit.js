// Límite sencillo de envíos del formulario de contacto, en memoria y por IP (sin dependencias).
// Frena bots y envíos repetidos; con varias instancias del servidor cada una lleva su propia cuenta.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map();

// Detrás de un proxy (Render, Nginx…) la IP real viene en X-Forwarded-For
const clientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || 'desconocida';
};

// Limpieza periódica para que el mapa no crezca sin fin
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of hits) if (entry.resetAt <= now) hits.delete(ip);
}, WINDOW_MS).unref();

export default function contactRateLimit(req, res, next) {
  const now = Date.now();
  const ip = clientIp(req);
  const entry = hits.get(ip);

  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    return res.status(429).json({
      error: 'Has enviado varios mensajes seguidos. Espera unos minutos e inténtalo de nuevo.',
    });
  }

  entry.count += 1;
  return next();
}
