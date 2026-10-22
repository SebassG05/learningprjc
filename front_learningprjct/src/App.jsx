import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import ScrollToTop from './components/layout/ScrollToTop';
import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Layout from './components/layout/Layout';
import Footer from './components/layout/Footer';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { distance, duration, ease } from './lib/motion';
import { glideToHash, jumpTo, startSmoothScroll, stopSmoothScroll } from './lib/smoothScroll';
import { lazyRoute, preloadAllWhenIdle, preloadOnIntent, routePending } from './lib/lazyRoute';
import Home from './pages/Home';

// Fuera del bundle inicial (la home no las necesita). Se pintan sin estado intermedio: ver lib/lazyRoute.js.
// Si al navegar el chunk aún no ha llegado, AnimatedRoutes suspende la navegación (ver allí) y la
// página actual sigue en pantalla hasta que llega; luego, la transición de siempre
const Contacto = lazyRoute(/^\/contacto\/?$/, () => import('./pages/Contacto'));
const ReviewsPage = lazyRoute(/^\/reseñas\/?$/, () => import('./pages/Reviews.jsx'));
const Ajustes = lazyRoute(/^\/ajustes\/?$/, () => import('./pages/Ajustes.jsx'));
const LoginPage = lazyRoute(/^\/login\/?$/, () => import('./pages/Login.jsx'));
const PoliticaCookies = lazyRoute(/^\/(politica-)?cookies\/?$/, () => import('./pages/PoliticaCookies.jsx'));
const GuiaUsuario = lazyRoute(/^\/guia-usuario\/?$/, () => import('./pages/GuiaUsuario.jsx'));
const Privacidad = lazyRoute(/^\/privacidad\/?$/, () => import('./pages/Privacidad.jsx'));
const TerminosUso = lazyRoute(/^\/terminos\/?$/, () => import('./pages/TerminosUso.jsx'));
const AvisoLegal = lazyRoute(/^\/aviso-legal\/?$/, () => import('./pages/AvisoLegal.jsx'));

// Posiciones de scroll por entrada del historial, para restaurarlas al volver atrás
const scrollPositions = new Map();

// Restaura el scroll cuando la página saliente ya es invisible. Si el destino aún está cargando
// datos y no alcanza la altura, reintenta unos fotogramas (se cancela si el usuario hace scroll).
function restoreScroll({ y, hash }) {
  if (hash && glideToHash(hash, { immediate: true })) return;
  jumpTo(y);
  if (y <= 0) return;
  let cancelled = false;
  const cancel = () => { cancelled = true; };
  window.addEventListener('wheel', cancel, { once: true, passive: true });
  window.addEventListener('touchstart', cancel, { once: true, passive: true });
  const until = performance.now() + 1200;
  (function retry() {
    if (cancelled || Math.abs(window.scrollY - y) < 2 || performance.now() > until) return;
    jumpTo(y);
    requestAnimationFrame(retry);
  })();
}

function AnimatedRoutes() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const target = useRef(null);

  // Ruta de destino en un chunk que aún no ha llegado: se suspende aquí, dentro de la transición de
  // la navegación, y React mantiene la página actual en pantalla hasta que llega (AnimatePresence
  // monta la página nueva fuera de esa transición: si suspendiera ella, se vería el hueco vacío)
  const pending = routePending(decodeURIComponent(location.pathname));
  if (pending) throw pending;

  // Guarda la posición de la entrada que se abandona (la página saliente sigue montada)
  useLayoutEffect(() => {
    const key = location.key;
    return () => { scrollPositions.set(key, window.scrollY); };
  }, [location.key]);

  target.current = {
    y: navigationType === 'POP' ? scrollPositions.get(location.key) ?? 0 : 0,
    hash: location.hash,
  };

  // Enlace directo con #seccion al cargar la app
  useEffect(() => {
    if (location.hash) {
      const t = setTimeout(() => glideToHash(location.hash), 400);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence mode="wait" onExitComplete={() => restoreScroll(target.current)}>
      <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/reset-password" element={
            <Suspense fallback={<RouteFallback />}>
              <PageTransition><ResetPassword /></PageTransition>
            </Suspense>
          } />
          <Route path="/forgot-password" element={
            <Suspense fallback={<RouteFallback />}>
              <PageTransition><ForgotPassword /></PageTransition>
            </Suspense>
          } />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/contacto" element={<PageTransition><Contacto /></PageTransition>} />
          <Route path="/cursos" element={
            <PageTransition>
              <Suspense fallback={<RouteFallback fill />}>
                <Cursos />
              </Suspense>
            </PageTransition>
          } />
          <Route path="/reseñas" element={<PageTransition><ReviewsPage /></PageTransition>} />
          <Route path="/ajustes" element={<PageTransition><Ajustes /></PageTransition>} />
          <Route path="/sobre" element={
            <PageTransition>
              <Suspense fallback={<RouteFallback fill />}>
                <SobreNosotros />
              </Suspense>
            </PageTransition>
          } />
          <Route path="/curso/:id" element={
            <Suspense fallback={<RouteFallback />}>
              <PageTransition><CursoDetalle /></PageTransition>
            </Suspense>
          } />
          <Route path="/curso/:id/inscripcion" element={
            <Suspense fallback={<RouteFallback />}>
              <PageTransition><CursoInscripcion /></PageTransition>
            </Suspense>
          } />
          <Route path="/curso/:id/invitacion" element={
            <Suspense fallback={<RouteFallback />}>
              <PageTransition><CursoInvitacion /></PageTransition>
            </Suspense>
          } />
          <Route path="/curso/:id/estructura" element={
            <Suspense fallback={<RouteFallback />}>
              <PageTransition><EstructuraCursoPage /></PageTransition>
            </Suspense>
          } />
          <Route path="/curso/:cursoId/tema-estudio" element={
            <Suspense fallback={<RouteFallback />}>
              <PageTransition><TemaEstudio /></PageTransition>
            </Suspense>
          } />
          <Route path="/curso/:cursoId/ejercicio/:ejercicioId/entregar" element={
            <Suspense fallback={<RouteFallback />}>
              <PageTransition><EntregaEjercicio /></PageTransition>
            </Suspense>
          } />
          <Route path="/admin/correcciones" element={
            <Suspense fallback={<RouteFallback />}>
              <PageTransition><CorreccionesAdmin /></PageTransition>
            </Suspense>
          } />
          <Route path="/cookies" element={<PageTransition><PoliticaCookies /></PageTransition>} />
          <Route path="/politica-cookies" element={<PageTransition><PoliticaCookies /></PageTransition>} />
          <Route path="/privacidad" element={<PageTransition><Privacidad /></PageTransition>} />
          <Route path="/terminos" element={<PageTransition><TerminosUso /></PageTransition>} />
          <Route path="/aviso-legal" element={<PageTransition><AvisoLegal /></PageTransition>} />
          <Route path="/guia-usuario" element={<PageTransition><GuiaUsuario /></PageTransition>} />
        </Routes>
      </AnimatePresence>
  );
}

// La página sale (rápida, acelerando) y la nueva entra; el pie viaja con la página para que no salte.
// En la carga directa de una URL no hay transición que mostrar: animar la entrada desde opacidad 0
// solo retrasaría el LCP. A partir de la primera navegación interna, las páginas entran animadas.
let hasNavigated = false;

function PageTransition({ children }) {
  const [initial] = useState(() => (hasNavigated ? { opacity: 0, y: distance.page } : false));
  useEffect(() => {
    hasNavigated = true;
  }, []);
  return (
    <motion.div
      className="flex min-h-[calc(100svh-4rem)] flex-col"
      initial={initial}
      animate={{ opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.outExpo } }}
      exit={{ opacity: 0, y: -8, transition: { duration: duration.fast, ease: ease.exit } }}
    >
      <div className="flex-grow">{children}</div>
      <Footer />
    </motion.div>
  );
}

// Carga diferida de rutas: indicador discreto en lugar de texto plano
// Con `fill` reserva la primera pantalla (la ruta empieza con un hero a pantalla completa) y el pie
// no sube y baja mientras llega el chunk.
// eslint-disable-next-line react/prop-types -- el proyecto no usa PropTypes
function RouteFallback({ fill = false }) {
  return (
    <div className={`flex items-center justify-center ${fill ? 'min-h-[calc(100svh-var(--spacing-header))]' : 'min-h-[60vh]'}`} role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-brand-400" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}

function App() {
  // Scroll con inercia (solo ratón/trackpad y sin reduced-motion) y restauración manual del scroll
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    startSmoothScroll();
    preloadAllWhenIdle();
    preloadOnIntent();
    return stopSmoothScroll;
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <ScrollToTop />
        <Layout>
          <Suspense fallback={null}>
            <AnimatedRoutes />
          </Suspense>
        </Layout>
      </Router>
    </MotionConfig>
  );
}

const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const Cursos = lazy(() => import('./pages/Cursos.jsx'));
const CursoDetalle = lazy(() => import('./pages/CursoDetalle.jsx'));
const CursoInscripcion = lazy(() => import('./pages/CursoInscripcion.jsx'));
const CursoInvitacion = lazy(() => import('./pages/CursoInvitacion.jsx'));
const EstructuraCursoPage = lazy(() => import('./pages/EstructuraCursoPage.jsx'));
const TemaEstudio = lazy(() => import('./pages/TemaEstudio.jsx'));
const EntregaEjercicio = lazy(() => import('./pages/EntregaEjercicio.jsx'));
const CorreccionesAdmin = lazy(() => import('./pages/CorrecionesAdmin.jsx'));
const SobreNosotros = lazy(() => import('./pages/SobreNosotros.jsx'));

export default App;