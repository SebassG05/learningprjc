// Límite de envíos del formulario de contacto: 5 cada 15 minutos por IP.
import createRateLimit from './rateLimit.js';

export default createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Has enviado varios mensajes seguidos. Espera unos minutos e inténtalo de nuevo.',
});
