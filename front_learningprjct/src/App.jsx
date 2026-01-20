import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Contacto from './pages/Contacto';
import ReviewsPage from './pages/Reviews.jsx';
import Ajustes from './pages/Ajustes.jsx';
import SobreNosotros from './pages/SobreNosotros.jsx';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reset-password" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <ResetPassword />
            </Suspense>
          } />
          <Route path="/forgot-password" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <ForgotPassword />
            </Suspense>
          } />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/reseñas" element={<ReviewsPage />} />
          <Route path="/ajustes" element={<Ajustes />} />
          <Route path="/sobre" element={<SobreNosotros />} />
        </Routes>
      </Layout>
    </Router>
  );
}

const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));

export default App;