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
            className="text-center text-gray-400 mb-10"
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >Inicia sesión para dejar tu reseña.</motion.div>
        )}
        {/* Aquí no se muestran las reseñas */}
      </motion.div>
    </div>
  );
}
