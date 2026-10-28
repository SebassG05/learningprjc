import { isKnownRoute } from './knownRoutes.js';

// En `vite` y `vite preview`, una navegación a una ruta que la SPA no conoce recibe index.html (la app
// pinta la página 404) pero con estado HTTP 404, igual que en producción con deploy/nginx-404.conf.
// Los archivos (con extensión), /api y los internos de Vite (/@vite, /@fs…) no se tocan.
function markNotFound(req, res, next) {
  const accept = req.headers.accept ?? '';
  const pathname = (() => {
    try {
      return decodeURIComponent(new URL(req.url, 'http://x').pathname);
    } catch {
      return null;
    }
  })();
  const isPageNavigation =
    req.method === 'GET' &&
    accept.includes('text/html') &&
    pathname !== null &&
    !/\.[a-z0-9]+$/i.test(pathname) &&
    !pathname.startsWith('/@') &&
    !pathname.startsWith('/api/');

  if (isPageNavigation && !isKnownRoute(pathname)) {
    // sirv y el middleware de HTML de Vite escriben 200 al enviar index.html: se cambia por 404
    const writeHead = res.writeHead;
    res.writeHead = function (code, ...rest) {
      return writeHead.call(this, code === 200 ? 404 : code, ...rest);
    };
    res.statusCode = 404;
  }
  next();
}

export default function notFoundStatus() {
  return {
    name: 'not-found-status',
    configureServer(server) {
      server.middlewares.use(markNotFound);
    },
    configurePreviewServer(server) {
      server.middlewares.use(markNotFound);
    },
  };
}
