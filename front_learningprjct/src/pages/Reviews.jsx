import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ description: '', rating: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
      setTimeout(() => setSuccess(false), 3000);
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
      <div className="bg-[#23272f]/80 backdrop-blur-md border border-[#a1db87]/10 rounded-3xl shadow-2xl px-4 sm:px-10 py-10">
        <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
          Califica nuestros <span className="text-[#a1db87]">cursos</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-8">
          Tu opinión ayuda a otros estudiantes a elegir mejor y nos permite mejorar la plataforma.
        </p>
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
      </div>
      {user ? (
        <form onSubmit={handleSubmit} className="bg-[#181b20] rounded-xl p-6 mb-10 shadow-lg">
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
                <button type="button" key={i} onClick={() => handleRating(i)} className="focus:outline-none">
                  <Star className={`w-7 h-7 ${i <= form.rating ? 'text-[#a1db87]' : 'text-gray-600'}`} fill={i <= form.rating ? '#a1db87' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          {error && <div className="text-red-400 mb-2">{error}</div>}
          {success && <div className="text-green-400 mb-2">¡Reseña publicada!</div>}
          <button type="submit" disabled={submitting || !form.description || !form.rating} className="w-full py-2 rounded bg-[#a1db87] text-[#181b20] font-bold hover:bg-emerald-400 transition-colors disabled:opacity-60">{submitting ? 'Enviando...' : 'Publicar reseña'}</button>
        </form>
      ) : (
        <div className="text-center text-gray-400 mb-10">Inicia sesión para dejar tu reseña.</div>
      )}
      {/* Aquí no se muestran las reseñas */}
      </div>
    </div>
  );
}
