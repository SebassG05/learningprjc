// Utilidades de los diálogos modales: fondo inerte y scroll bloqueado sin salto.

// Marca inerte todo lo que cuelga de `node` salvo las ramas que contienen algo de `keep`
// (el propio diálogo, otros diálogos como el banner de cookies y las regiones de avisos)
export function inertOutside(node, keep, out = []) {
  for (const child of node.children) {
    if (child.matches(keep)) continue;
    if (child.querySelector(keep)) inertOutside(child, keep, out);
    else if (!child.inert) {
      child.inert = true;
      out.push(child);
    }
  }
  return out;
}

const KEEP = '[role="dialog"], [role="alertdialog"], [role="status"], [aria-live]';

// Fondo inerte + scroll de la página bloqueado (reservando el hueco de la barra si la había,
// para que nada salte). Devuelve cómo deshacerlo.
export function lockPage() {
  const root = document.getElementById('root');
  const inerted = root ? inertOutside(root, KEEP) : [];
  const html = document.documentElement;
  const prev = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter };
  const hadScrollbar = window.innerWidth > html.clientWidth;
  html.style.overflow = 'hidden';
  if (hadScrollbar) html.style.scrollbarGutter = 'stable';
  return () => {
    inerted.forEach((el) => {
      el.inert = false;
    });
    html.style.overflow = prev.overflow;
    html.style.scrollbarGutter = prev.gutter;
  };
}
