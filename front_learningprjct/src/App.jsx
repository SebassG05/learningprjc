import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/layout/ScrollToTop';
import React, { Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { duration, ease } from './lib/motion';
import Home from './pages/Home';
import Contacto from './pages/Contacto';
import ReviewsPage from './pages/Reviews.jsx';
import Ajustes from './pages/Ajustes.jsx';
import SobreNosotros from './pages/SobreNosotros.jsx';
import Cursos from './pages/Cursos.jsx';
import LoginPage from './pages/Login.jsx';
import PoliticaCookies from './pages/PoliticaCookies.jsx';
import GuiaUsuario from './pages/GuiaUsuario.jsx';
import Privacidad from './pages/Privacidad.jsx';
import TerminosUso from './pages/TerminosUso.jsx';
import AvisoLegal from './pages/AvisoLegal.jsx';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
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
          <Route path="/cursos" element={<PageTransition><Cursos /></PageTransition>} />
          <Route path="/reseñas" element={<PageTransition><ReviewsPage /></PageTransition>} />
          <Route path="/ajustes" element={<PageTransition><Ajustes /></PageTransition>} />
          <Route path="/sobre" element={<PageTransition><SobreNosotros /></PageTransition>} />
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

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.outExpo } }}
      exit={{ opacity: 0, transition: { duration: duration.fast, ease: ease.standard } }}
    >
      {children}
    </motion.div>
  );
}

// Carga diferida de rutas: indicador discreto en lugar de texto plano
function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-brand-400" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <ScrollToTop />
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </Router>
    </MotionConfig>
  );
}

const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const CursoDetalle = lazy(() => import('./pages/CursoDetalle.jsx'));
const CursoInscripcion = lazy(() => import('./pages/CursoInscripcion.jsx'));
const EstructuraCursoPage = lazy(() => import('./pages/EstructuraCursoPage.jsx'));
const TemaEstudio = lazy(() => import('./pages/TemaEstudio.jsx'));
const EntregaEjercicio = lazy(() => import('./pages/EntregaEjercicio.jsx'));
const CorreccionesAdmin = lazy(() => import('./pages/CorrecionesAdmin.jsx'));

export default App;