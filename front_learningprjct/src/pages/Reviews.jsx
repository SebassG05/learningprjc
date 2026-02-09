import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Star, CheckCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const fetchReviews = async () => {
  const res = await fetch('/api/reviews');
  if (!res.ok) throw new Error('Error al cargar reseñas');
  return res.json();
};

const postReview = async (review, token) => {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error('Error al enviar reseña');
  return res.json();
};

export default function ReviewsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ description: '', rating: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Animación de entrada
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    fetchReviews()
      .then(data => setReviews(data))
      .catch(() => setError('No se pudieron cargar las reseñas'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRating = r => {
    setForm(f => ({ ...f, rating: r }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.description || !form.rating) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const review = {
        description: form.description,
        rating: form.rating,
        name: user?.name || ''
      };
      const newReview = await postReview(review, token);
      setReviews([newReview, ...reviews]);
      setForm({ description: '', rating: 0 });
      setSuccess(true);
      // Redirige al home después de 1 segundo
      setTimeout(() => {
        setSuccess(false);
        navigate('/');
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100); // Espera breve para asegurar que la navegación ocurrió
      }, 1000);
    } catch {
      setError('No se pudo enviar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  // Calcular número de reseñas y media
  const reviewsCount = reviews.length;
  const reviewsAvg = reviewsCount > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewsCount).toFixed(2) : '0.00';

  return (
    <div className="max-w-3xl mx-auto py-12 px-2">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : {}}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="inline-flex items-center px-4 py-2 bg-[#2a2a2a] border border-[#a1db87]/30 rounded-full mb-4"
        >
          <Sparkles className="w-4 h-4 text-[#a1db87] mr-2 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold text-[#a1db87]">
            Reseñas
          </span>
        </motion.div>
      </div>
      {/* Fondo decorativo animado */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#a1db87]/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#a1db87]/5 rounded-full blur-3xl pointer-events-none z-0" />
      <motion.div
        ref={sectionRef}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="bg-[#23272f]/80 backdrop-blur-md border border-[#a1db87]/10 rounded-3xl shadow-2xl px-4 sm:px-10 py-10 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Califica nuestros <span className="text-[#a1db87]">cursos</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Tu opinión ayuda a otros estudiantes a elegir mejor y nos permite mejorar la plataforma.
          </p>
        </motion.div>
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-xl bg-[#23272f] border border-[#a1db87]/20 rounded-2xl px-8 py-4 flex items-center justify-between shadow">
            <span className="text-[#a1db87] font-bold text-lg">
              {reviewsCount}
              <span className="text-gray-300 font-normal text-base ml-2">reseñas publicadas</span>
            </span>
            <span className="text-[#a1db87] font-bold text-lg">
              {reviewsAvg} <span className="text-gray-300 font-normal text-base">/ 5 media</span>
            </span>
          </div>
        </div>
        {user ? (
          <motion.form
            onSubmit={handleSubmit}
            className="bg-[#181b20] rounded-xl p-6 mb-10 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-[#a1db87]">Escribe tu reseña</h2>
            <div className="mb-3">
              <label className="block text-sm mb-1 text-gray-300">Email</label>
              <input type="email" value={user.email} disabled className="w-full px-3 py-2 rounded bg-[#181b20] border border-[#a1db87]/30 text-gray-400 cursor-not-allowed" />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1 text-gray-300">Reseña</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} required className="w-full px-3 py-2 rounded bg-[#181b20] border border-[#a1db87]/30 text-white" placeholder="¿Qué te ha parecido la plataforma?" />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-gray-300">Puntuación</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <motion.button
                    type="button"
                    key={i}
                    onClick={() => handleRating(i)}
                    className="focus:outline-none"
                    whileHover={{ scale: 1.2, rotate: -8 }}
                    whileTap={{ scale: 1.35, rotate: 8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Star
                      className={`w-7 h-7 ${i <= form.rating ? 'text-[#a1db87]' : 'text-gray-600'}`}
                      fill={i <= form.rating ? '#a1db87' : 'none'}
                      style={{ filter: i <= form.rating ? 'drop-shadow(0 0 6px #a1db87aa)' : 'none', transition: 'filter 0.2s' }}
                    />
                  </motion.button>
                ))}
              </div>
            </div>
            {error && <div className="text-red-400 mb-2">{error}</div>}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-2 p-4 mb-4 rounded-xl bg-[#1e3a1a] border border-[#a1db87]/40 shadow-lg text-[#a1db87] text-base font-semibold"
              >
                <CheckCircle className="w-6 h-6 text-[#a1db87] animate-bounce" />
                ¡Reseña publicada con éxito!
              </motion.div>
            )}
            <button type="submit" disabled={submitting || !form.description || !form.rating} className="cursor-pointer w-full py-2 rounded bg-[#a1db87] text-[#181b20] font-bold hover:bg-emerald-400 transition-colors disabled:opacity-60">{submitting ? 'Enviando...' : 'Publicar reseña'}</button>
          </motion.form>
        ) : (
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1f26] via-[#1e2530] to-[#1a1f26] border border-[#a1db87]/20 p-8 mb-10 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Efecto de brillo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#a1db87]/5 to-transparent animate-pulse" />
            
            <div className="relative z-10 text-center space-y-6">
              {/* Icono decorativo */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#a1db87]/20 blur-xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-[#a1db87]/10 to-[#a1db87]/5 p-4 rounded-full border border-[#a1db87]/30">
                    <svg className="w-12 h-12 text-[#a1db87]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Título principal */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Comparte tu experiencia
                </h3>
                <p className="text-gray-400 text-base leading-relaxed max-w-md mx-auto">
                  Tu opinión es valiosa para nuestra comunidad. Únete para compartir tus reseñas y ayudar a otros estudiantes.
                </p>
              </div>

              {/* Botón de acción */}
              <motion.button
                onClick={() => {
                  const authButton = document.querySelector('[data-auth-trigger]');
                  if (authButton) authButton.click();
                }}
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-[#a1db87] to-[#8bc970] text-[#181b20] font-bold rounded-xl shadow-lg hover:shadow-[#a1db87]/25 transition-all duration-300 hover:scale-105 active:scale-95"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Iniciar sesión o registrarse</span>
              </motion.button>

              {/* Beneficios */}
              <div className="flex items-center justify-center gap-6 pt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#a1db87]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Rápido y seguro
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#a1db87]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  100% gratuito
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {/* Aquí no se muestran las reseñas */}
      </motion.div>
    </div>
  );
}
