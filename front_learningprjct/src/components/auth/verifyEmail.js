// Confirmar el correo con el código de 6 cifras (registro con contraseña). Lógica sin React, con tests.

export const REENVIO_SEG = 60;

// Solo cifras y como mucho 6 (pegar «123 456» o «Código: 123456» también vale)
export const limpiarCodigo = (value) => String(value ?? '').replace(/\D/g, '').slice(0, 6);

// Respuesta de POST /api/users/verificar-correo con error → texto para el usuario
export function mensajeVerificacion(status, body = {}) {
  if (status === 429) return body.error || 'Demasiados intentos. Espera unos minutos.';
  switch (body.code) {
    case 'wrong':
      return body.restantes === 1
        ? 'El código no es correcto. Te queda 1 intento.'
        : `El código no es correcto. Te quedan ${body.restantes} intentos.`;
    case 'expired':
      return 'El código ha caducado. Pide uno nuevo.';
    case 'too-many':
      return 'Demasiados intentos con este código. Pide uno nuevo.';
    case 'invalid':
      return 'Este código ya no sirve. Pide uno nuevo.';
    default:
      return body.error || 'No se ha podido comprobar el código.';
  }
}

// Cuando hay que pedir otro código, el botón de reenviar pasa a ser la acción principal
export const pideNuevoCodigo = (body = {}) => ['expired', 'too-many', 'invalid'].includes(body.code);
