// Precarga de una ruta con lazy() cuando se entra directamente por su URL.
// Sin esto la cadena es HTML → bundle principal → (se ejecuta) → chunk de la ruta → datos: varios viajes
// de red antes de pintar. El script inyectado en <head> mira la URL y añade:
//   · <link rel="modulepreload"> del chunk y sus dependencias (bajan en paralelo con el bundle principal)
//   · opcionalmente <link rel="preload" as="fetch"> de los datos de la ruta ($1, $2… = grupos de la URL);
//     el fetch() posterior de la página reutiliza esa respuesta en vez de pedirla otra vez.
// Solo afecta a la build. Rutas: [regex sobre pathname, módulo de la página, plantilla de datos opcional].
export default function routeModulePreload(routes, { apiBase = '' } = {}) {
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
        for (const [pattern, page, data] of routes) {
          const chunk = chunks.find((c) => c.facadeModuleId?.replace(/\\/g, '/').endsWith(page));
          if (!chunk) throw new Error(`route-modulepreload: no hay chunk para ${page}`);
          const files = [chunk.fileName, ...chunk.imports.filter((f) => !isEntry(f))];
          table.push([pattern.source, pattern.flags, files.map((f) => `/${f}`), data ? apiBase + data : null]);
        }

        const script =
          `(function(){var r=${JSON.stringify(table)},p=location.pathname;` +
          'function l(rel,h,as){var e=document.createElement("link");e.rel=rel;e.href=h;if(as){e.as=as;e.crossOrigin="anonymous";}document.head.appendChild(e);}' +
          'for(var i=0;i<r.length;i++){var m=new RegExp(r[i][0],r[i][1]).exec(p);if(m){' +
          'r[i][2].forEach(function(h){l("modulepreload",h);});' +
          'if(r[i][3])l("preload",r[i][3].replace(/\\$(\\d)/g,function(_,n){return m[n];}),"fetch");' +
          'return;}}})();';
        return { html, tags: [{ tag: 'script', children: script, injectTo: 'head-prepend' }] };
      },
    },
  };
}
