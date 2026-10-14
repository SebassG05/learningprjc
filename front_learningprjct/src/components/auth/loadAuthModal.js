// Carga del diálogo de acceso en su propio chunk. Una sola promesa: la precarga (hover o foco
// en "Acceder") y la apertura comparten la misma descarga. Si falla (sin conexión, o el chunk
// de un despliegue anterior ya no existe) se olvida, para que el siguiente intento lo reintente.
export function createLoader(load) {
  let pending = null;
  return () => {
    pending ??= load().catch((err) => {
      pending = null;
      throw err;
    });
    return pending;
  };
}

export const loadAuthModal = createLoader(() => import('./AuthModal.jsx'));

// Para hover/foco: una precarga fallida no debe dejar promesas rechazadas sin tratar
export function preloadAuthModal() {
  loadAuthModal().catch(() => {});
}
