// IP y navegador del cliente. El backend va detrás de Cloudflare/Render y no usa `trust proxy`:
// la IP real llega en CF-Connecting-IP (Cloudflare) o en el primer valor de X-Forwarded-For.
const first = (value) => (typeof value === 'string' && value.length ? value.split(',')[0].trim() : null);

export const clientIp = (req) =>
  first(req.headers['cf-connecting-ip']) || first(req.headers['x-forwarded-for']) || req.ip || req.socket?.remoteAddress || 'desconocida';

export const forwardedFor = (req) => (typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'].slice(0, 256) : undefined);

export const userAgent = (req) => (typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'].slice(0, 512) : undefined);
