import crypto from 'crypto';

// Las cuentas creadas con Google guardaban como contraseña el `sub` de Google (solo dígitos, ~21), que no
// es secreto: con el correo y ese número se podía entrar. Una contraseña con esa forma no se acepta ni
// para entrar ni al elegirla.
const GOOGLE_ID_SHAPE = /^\d{15,30}$/;

export const looksLikeGoogleId = (password) => typeof password === 'string' && GOOGLE_ID_SHAPE.test(password);

export const GOOGLE_ID_PASSWORD_MESSAGE = 'Elige una contraseña que no sea solo una serie larga de números.';

// Para cuentas que entran con Google: nadie la conoce, así que no sirve para entrar con contraseña.
// Quien quiera usar contraseña la crea con «He olvidado mi contraseña».
export const randomPassword = () => crypto.randomBytes(32).toString('base64url');
