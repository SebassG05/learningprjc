import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/layout/ScrollToTop';
import React, { Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import { AnimatePresence, motion } from 'framer-motion';
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

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/reset-password" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <PageTransition><ResetPassword /></PageTransition>
            </Suspense>
          } />
          <Route path="/forgot-password" element={
            <Suspense fallback={<div>Cargando...</div>}>
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
            <Suspense fallback={<div>Cargando...</div>}>
              <PageTransition><CursoDetalle /></PageTransition>
            </Suspense>
          } />
          <Route path="/curso/:id/inscripcion" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <PageTransition><CursoInscripcion /></PageTransition>
            </Suspense>
          } />
          <Route path="/curso/:id/estructura" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <PageTransition><EstructuraCursoPage /></PageTransition>
            </Suspense>
          } />
          <Route path="/curso/:cursoId/tema-estudio" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <PageTransition><TemaEstudio /></PageTransition>
            </Suspense>
          } />
          <Route path="/curso/:cursoId/ejercicio/:ejercicioId/entregar" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <PageTransition><EntregaEjercicio /></PageTransition>
            </Suspense>
          } />
          <Route path="/cookies" element={<PageTransition><PoliticaCookies /></PageTransition>} />
          <Route path="/politica-cookies" element={<PageTransition><PoliticaCookies /></PageTransition>} />
          <Route path="/privacidad" element={<PageTransition><Privacidad /></PageTransition>} />
          <Route path="/terminos" element={<PageTransition><TerminosUso /></PageTransition>} />
          <Route path="/guia-usuario" element={<PageTransition><GuiaUsuario /></PageTransition>} />
        </Routes>
      </AnimatePresence>
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1]
      }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </Router>
  );
}

const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const CursoDetalle = lazy(() => import('./pages/CursoDetalle.jsx'));
const CursoInscripcion = lazy(() => import('./pages/CursoInscripcion.jsx'));
const EstructuraCursoPage = lazy(() => import('./pages/EstructuraCursoPage.jsx'));
const TemaEstudio = lazy(() => import('./pages/TemaEstudio.jsx'));
const EntregaEjercicio = lazy(() => import('./pages/EntregaEjercicio.jsx'));

export default App;