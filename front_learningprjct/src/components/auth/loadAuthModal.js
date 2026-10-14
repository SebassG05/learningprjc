// Carga del diálogo de acceso en su propio chunk. Una sola promesa: la precarga (hover o foco
// en "Acceder") y la apertura comparten la misma descarga.
let pending = null;

export function preloadAuthModal() {
  pending ??= import('./AuthModal.jsx');
  return pending;
}
