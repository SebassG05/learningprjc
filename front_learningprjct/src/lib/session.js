// Qué hacer con la sesión guardada tras preguntar a /api/users/me al arrancar.
// - 401: el token ya no vale (caducó a los 7 días o es inválido) → cerrar sesión. Si no, la cabecera
//   mostraría al usuario pero el backend lo trataría como anónimo (p. ej. «acceso por invitación»
//   en un curso privado al que sí tiene acceso).
// - Error de red o del servidor: se conserva (se puede seguir viendo lo ya cargado).
// - Token «undefined»/«null»: sesiones rotas de cuando el registro no devolvía token.
export function sessionCheckResult(response, storedToken) {
  if (storedToken === 'undefined' || storedToken === 'null') return 'expired';
  if (!response) return 'unknown';
  if (response.status === 401) return 'expired';
  return response.ok || response.status === 200 ? 'valid' : 'unknown';
}
