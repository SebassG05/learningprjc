import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Contacto from './pages/Contacto';
import ReviewsPage from './pages/Reviews.jsx';

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
        </Routes>
      </Layout>
    </Router>
  );
}

const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));

export default App;