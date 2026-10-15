import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion, useReducedMotion } from 'framer-motion';
import { duration, ease, stagger } from '../lib/motion';
import { glideTo } from '../lib/smoothScroll';
import usePageMeta from '../hooks/usePageMeta';
import ReviewsBackdrop from '../components/reviews/ReviewsBackdrop';
import ReviewsHero from '../components/reviews/ReviewsHero';
import ReviewsSummary from '../components/reviews/ReviewsSummary';
import ReviewComposer from '../components/reviews/ReviewComposer';
import ReviewInvite from '../components/reviews/ReviewInvite';
import ReviewList from '../components/reviews/ReviewList';
import ReviewsEmptyState from '../components/reviews/ReviewsEmptyState';
import ReviewsOrbit, { MAX_SATELLITES } from '../components/reviews/ReviewsOrbit';
import { ratingDistribution, toReviewViewModel } from '../components/reviews/reviewFormat';
import { ORBIT_HINT, PAGE_DESCRIPTION, PAGE_TITLE } from '../components/reviews/reviewsCopy';

const LOAD_ERROR = 'No se pudieron cargar las reseñas';
const SEND_ERROR = 'No se pudo enviar la reseña';

const fetchReviews = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
  const res = await fetch(`${apiUrl}/api/reviews`);
  if (!res.ok) throw new Error('Error al cargar reseñas');
  const json = await res.json();
  return json.data || json;
};

const postReview = async (review, token) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
  const res = await fetch(`${apiUrl}/api/reviews`, {
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

// Abre el mismo diálogo de acceso que el botón del header
const openAuth = () => {
  const authButton = document.querySelector('[data-auth-trigger]');
  if (authButton) authButton.click();
};

export default function ReviewsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ description: '', rating: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  // Tarjeta y satélite enlazados (solo presentación)
  const [activeId, setActiveId] = useState(null);

  usePageMeta(PAGE_TITLE, PAGE_DESCRIPTION);

  useEffect(() => {
    fetchReviews()
      .then(data => setReviews(data))
      .catch(() => setError(LOAD_ERROR))
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
          glideTo(0);
        }, 100); // Espera breve para asegurar que la navegación ocurrió
      }, 1000);
    } catch {
      setError(SEND_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  // Calcular número de reseñas y media
  const reviewsCount = reviews.length;
  const reviewsAvg = reviewsCount > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewsCount).toFixed(2) : '0.00';

  // Presentación: una sola forma para tarjetas y órbita
  const items = useMemo(() => reviews.map(toReviewViewModel), [reviews]);
  const distribution = useMemo(() => ratingDistribution(items), [items]);

  const activate = useCallback(id => setActiveId(id), []);
  const deactivate = useCallback(id => setActiveId(current => (current === id ? null : current)), []);
  const revealCard = useCallback(id => {
    const card = document.getElementById(`review-${id}`);
    if (!card) return;
    glideTo(card.getBoundingClientRect().top + window.scrollY - 140);
    card.focus({ preventScroll: true });
  }, []);

  // Entrada escalonada corta; con reduced motion, solo fundido
  const group = { hidden: {}, show: { transition: { staggerChildren: stagger.cards, delayChildren: 0.05 } } };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? duration.fast : duration.scene, ease: ease.outExpo } },
  };

  const hasReviews = !loading && !error && items.length > 0;

  return (
    <div className="relative isolate min-h-dvh pb-32">
      <ReviewsBackdrop />

      <motion.div variants={group} initial="hidden" animate="show" className="mx-auto w-full max-w-wide px-gutter pt-8 sm:pt-12 lg:pt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-16 xl:gap-x-24">
          <div className="flex flex-col gap-12 lg:col-span-7 lg:gap-16 lg:pt-6">
            <motion.div variants={item}>
              <ReviewsHero />
            </motion.div>
            <motion.div variants={item}>
              <ReviewsSummary count={reviewsCount} average={Number(reviewsAvg)} distribution={distribution} loading={loading} />
            </motion.div>
          </div>

          <motion.div variants={item} className="relative rounded-3xl glass-panel p-6 sm:p-8 lg:col-span-5 lg:self-start">
            {user ? (
              <ReviewComposer
                user={user}
                form={form}
                onTextChange={handleChange}
                onRate={handleRating}
                onSubmit={handleSubmit}
                submitting={submitting}
                error={error === SEND_ERROR ? error : null}
                success={success}
              />
            ) : (
              <ReviewInvite onAccess={openAuth} />
            )}
          </motion.div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 lg:mt-28 lg:grid-cols-12 lg:gap-x-16 xl:gap-x-24">
          <div className={hasReviews || loading ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <ReviewList
              reviews={items}
              loading={loading}
              error={error === LOAD_ERROR ? error : null}
              activeId={activeId}
              onActivate={activate}
              onDeactivate={deactivate}
            >
              <ReviewsEmptyState />
            </ReviewList>
          </div>

          {hasReviews && (
            <aside aria-label="Órbita de reseñas" className="hidden lg:col-span-4 lg:block">
              <figure className="sticky top-32 -mx-6 xl:-mx-10">
                <ReviewsOrbit reviews={items} activeId={activeId} onActivate={activate} onDeactivate={deactivate} onSelect={revealCard} />
                <figcaption className="mx-6 mt-6 max-w-xs text-sm text-ink-2 xl:mx-10">
                  <span className="mb-2 block font-mono text-xs uppercase tracking-[0.18em] text-brand-200/80">
                    {`${Math.min(items.length, MAX_SATELLITES)} señales en órbita`}
                  </span>
                  {ORBIT_HINT}
                  {items.length > MAX_SATELLITES && ` Se muestran las ${MAX_SATELLITES} más recientes.`}
                </figcaption>
              </figure>
            </aside>
          )}
        </div>
      </motion.div>
    </div>
  );
}
