// Precarga del chunk de una ruta con lazy() cuando se entra directamente por su URL.
// Sin esto la cadena es HTML → bundle principal → (se ejecuta) → chunk de la ruta: un viaje de red
// más antes de pintar. El script inyectado en <head> mira la URL y añade <link rel="modulepreload">
// del chunk y sus dependencias, que así bajan en paralelo con el bundle principal.
// Solo afecta a la build; las rutas se dan como [expresión regular sobre pathname, módulo de la página].
export default function routeModulePreload(routes) {
  return {
    name: 'route-modulepreload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;
        const chunks = Object.values(bundle).filter((c) => c.type === 'chunk');
        const isEntry = (file) => bundle[file]?.isEntry;

        const table = [];
        for (const [pattern, page] of routes) {
          const chunk = chunks.find((c) => c.facadeModuleId?.replace(/\\/g, '/').endsWith(page));
          if (!chunk) throw new Error(`route-modulepreload: no hay chunk para ${page}`);
          const files = [chunk.fileName, ...chunk.imports.filter((f) => !isEntry(f))];
          table.push([pattern.source, files.map((f) => `/${f}`)]);
        }

        const script =
          `(function(){var r=${JSON.stringify(table)},p=location.pathname;` +
          'for(var i=0;i<r.length;i++){if(new RegExp(r[i][0]).test(p)){' +
          'r[i][1].forEach(function(h){var l=document.createElement("link");l.rel="modulepreload";l.href=h;document.head.appendChild(l);});' +
          'return;}}})();';
        return { html, tags: [{ tag: 'script', children: script, injectTo: 'head-prepend' }] };
      },
    },
  };
}
