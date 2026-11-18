// Verificación del correo al registrarse con contraseña: un código de 6 cifras enviado al correo.
// Hasta confirmarlo la cuenta no tiene sesión, así nadie se queda con el correo de otra persona.
// Solo se guarda el hash del código, ligado a la cuenta; caduca, admite pocos intentos y no se reenvía
// más de una vez por minuto.
import crypto from 'crypto';
import User from '../models/User.js';
import { normalizeEmail } from '../utils/email.js';
import { sendEmailVerificationCode } from './mailService.js';

export const CODE_TTL_MIN = 15;
export const MAX_INTENTOS = 5;
export const REENVIO_SEG = 60;

export class VerificationError extends Error {
  constructor(code, extra = {}) {
    super(code);
    this.code = code;
    Object.assign(this, extra);
  }
}

const hashCodigo = (userId, codigo) => crypto.createHash('sha256').update(`${userId}:${codigo}`).digest('hex');
const nuevoCodigo = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
const igual = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

/**
 * Genera un código nuevo (anula el anterior) y lo manda al correo de la cuenta.
 * @returns {Promise<{ sent: boolean, reason?: 'cooldown' | 'not-pending' }>}
 */
export async function enviarCodigo(user, { now = new Date() } = {}) {
  const fresh = await User.findById(user._id).select('+verificacionCorreo email name emailPendiente');
  if (!fresh?.emailPendiente) return { sent: false, reason: 'not-pending' };
  const prev = fresh.verificacionCorreo?.enviadoAt;
  if (prev && now - prev < REENVIO_SEG * 1000) return { sent: false, reason: 'cooldown' };

  const codigo = nuevoCodigo();
  const codigoHash = hashCodigo(fresh._id, codigo);
  // Condicionado al envío anterior: dos peticiones a la vez no mandan dos códigos
  const { modifiedCount } = await User.updateOne(
    { _id: fresh._id, emailPendiente: true, 'verificacionCorreo.enviadoAt': prev ?? { $exists: false } },
    { $set: { verificacionCorreo: { codigoHash, expiresAt: new Date(now.getTime() + CODE_TTL_MIN * 60 * 1000), intentos: 0, enviadoAt: now } } },
  );
  if (!modifiedCount) return { sent: false, reason: 'cooldown' };
  try {
    await sendEmailVerificationCode({ to: fresh.email, name: fresh.name, code: codigo, minutes: CODE_TTL_MIN });
  } catch (err) {
    // No llegó: se quita, para poder pedir otro enseguida
    await User.updateOne({ _id: fresh._id, 'verificacionCorreo.codigoHash': codigoHash }, { $unset: { verificacionCorreo: 1 } });
    throw err;
  }
  return { sent: true };
}

// Para los controladores: un fallo del correo no rompe el registro ni el login (se puede reenviar)
export async function enviarCodigoSafely(user, options) {
  try {
    return await enviarCodigo(user, options);
  } catch (err) {
    console.error('No se pudo enviar el código de verificación:', err.message);
    return { sent: false, reason: 'mail-failed' };
  }
}

/**
 * Comprueba el código. Si es correcto, la cuenta queda verificada y se devuelve.
 * Errores (VerificationError.code): invalid (sin código en curso), expired, too-many, wrong (con `restantes`).
 */
export async function verificarCodigo({ email, codigo, now = new Date() }) {
  const limpio = String(codigo ?? '').replace(/\s+/g, '');
  const user = await User.findOne({ email: normalizeEmail(email) }).select('+verificacionCorreo');
  const v = user?.verificacionCorreo;
  if (!user?.emailPendiente || !v?.codigoHash) throw new VerificationError('invalid');
  if (v.expiresAt <= now) throw new VerificationError('expired');

  // El intento se cuenta antes de comparar, de forma atómica: varias peticiones a la vez no saltan el límite
  const counted = await User.findOneAndUpdate(
    { _id: user._id, 'verificacionCorreo.codigoHash': v.codigoHash, 'verificacionCorreo.intentos': { $lt: MAX_INTENTOS } },
    { $inc: { 'verificacionCorreo.intentos': 1 } },
    { new: true, projection: { verificacionCorreo: 1 } },
  );
  if (!counted) throw new VerificationError('too-many');

  if (!/^\d{6}$/.test(limpio) || !igual(hashCodigo(user._id, limpio), v.codigoHash)) {
    const restantes = MAX_INTENTOS - counted.verificacionCorreo.intentos;
    throw new VerificationError(restantes > 0 ? 'wrong' : 'too-many', { restantes });
  }

  const verified = await User.findOneAndUpdate(
    { _id: user._id, emailPendiente: true, 'verificacionCorreo.codigoHash': v.codigoHash },
    { $unset: { emailPendiente: 1, verificacionCorreo: 1 }, $set: { emailVerificadoAt: now } },
    { new: true },
  );
  if (!verified) throw new VerificationError('invalid');
  return verified;
}

// Otra prueba de que el correo es suyo (Google verificado, enlace de «He olvidado mi contraseña»)
export async function marcarVerificado(userId, now = new Date()) {
  await User.updateOne(
    { _id: userId, emailPendiente: true },
    { $unset: { emailPendiente: 1, verificacionCorreo: 1 }, $set: { emailVerificadoAt: now } },
  );
}
