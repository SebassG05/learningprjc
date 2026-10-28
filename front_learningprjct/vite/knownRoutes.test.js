import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isKnownRoute } from './knownRoutes.js';

// Cada <Route path="…"> de App.jsx (con sus parámetros rellenos) tiene que ser una ruta conocida:
// si se añade una página y no se apunta aquí, el servidor la serviría con 404
test('todas las rutas de App.jsx están en KNOWN_ROUTES', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const paths = [...app.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]).filter((p) => p !== '*');
  assert.ok(paths.length > 20);
  for (const path of paths) {
    const sample = path.replace(/:[^/]+/g, '69d50406663e8648d7ee1f08');
    assert.ok(isKnownRoute(sample), `${path} no está en vite/knownRoutes.js`);
    assert.ok(path === '/' || isKnownRoute(`${sample}/`), `${path}/ (con barra final)`);
  }
});

test('lo que no es una ruta de la SPA da 404', () => {
  for (const path of ['/registro', '/cursoss', '/curso', '/curso/abc/otra', '/admin', '/sobre/equipo', '//']) {
    assert.equal(isKnownRoute(path), false, path);
  }
});
