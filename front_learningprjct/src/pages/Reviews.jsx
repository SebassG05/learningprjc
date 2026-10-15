import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { motion, useReducedMotion } from 'framer-motion';
import { duration, ease, stagger } from '../lib/motion';
import { glideTo } from '../lib/smoothScroll';
import { fetchReviews, postReview } from '../lib/reviewsApi';
import usePageMeta from '../hooks/usePageMeta';
import ReviewsBackdrop from '../components/reviews/ReviewsBackdrop';
import ReviewsHero from '../components/reviews/ReviewsHero';
import ReviewsSummary from '../components/reviews/ReviewsSummary';
import ReviewComposer from '../components/reviews/ReviewComposer';
import ReviewInvite from '../components/reviews/ReviewInvite';
import ReviewList from '../components/reviews/ReviewList';
import ReviewsEmptyState from '../components/reviews/ReviewsEmptyState';
import ReviewsVoiceprint, { MAX_VOICES } from '../components/reviews/ReviewsVoiceprint';
import { ratingDistribution, toReviewViewModel } from '../components/reviews/reviewFormat';
import { PAGE_DESCRIPTION, PAGE_TITLE, VOICES } from '../components/reviews/reviewsCopy';

const LOAD_ERROR = 'No se pudieron cargar las reseñas';
const SEND_ERROR = 'No se pudo enviar la reseña';
const SUCCESS_MS = 2400; // lo que dura el momento de éxito antes de volver al formulario

// Copia sin una clave (para limpiar el error de un campo al editarlo)
const without = (obj, key) => {
  if (!(key in obj)) return obj;
  const next = { ...obj };
  delete next[key];
  return next;
};

// Abre el mismo diálogo de acceso que el botón del header
const openAuth = () => {
  const authButton = document.querySelector('[data-auth-trigger]');
  if (authButton) authButton.click();
};

export default function ReviewsPage() {
  const { user } = useUser();
  const reduce = useReducedMotion();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [sendError, setSendError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({ description: '', rating: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  // Tarjeta y su barra de la huella de voces enlazadas (solo presentación)
  const [activeId, setActiveId] = useState(null);
  const successTimer = useRef(null);

  usePageMeta(PAGE_TITLE, PAGE_DESCRIPTION);

  // Con sesión, el servidor marca las reseñas propias; se vuelve a pedir al entrar o salir
  const viewer = user ? user._id || user.id || user.email : null;
  useEffect(() => {
    let alive = true;
    fetchReviews(viewer ? localStorage.getItem('token') : undefined)
      .then(data => alive && (setReviews(data), setLoadError(null)))
      .catch(() => alive && setLoadError(LOAD_ERROR))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [viewer]);

  useEffect(() => () => clearTimeout(successTimer.current), []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors(current => without(current, e.target.name));
  };

  const handleRating = r => {
    setForm(f => ({ ...f, rating: r }));
    setFieldErrors(current => without(current, 'rating'));
  };

  // Foco al primer campo con error, en el orden del formulario
  const focusFirstError = fields => {
    if (fields.rating) document.querySelector('input[name="rating"]')?.focus();
    else if (fields.description) document.getElementById('review-description')?.focus();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.description || !form.rating || submitting) return;
    setSubmitting(true);
    setSendError(null);
    setFieldErrors({});
    try {
      const token = localStorage.getItem('token');
      const review = {
        description: form.description,
        rating: form.rating,
        name: user?.name || ''
      };
      const newReview = await postReview(review, token);
      setReviews(current => [newReview, ...current]);
      setForm({ description: '', rating: 0 });
      setSuccess(true);
      // Se queda en la página: la reseña nueva encabeza el muro como "Tu reseña"
      clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccess(false), SUCCESS_MS);
    } catch (err) {
      const fields = err?.fields || {};
      if (Object.keys(fields).length) {
        setFieldErrors(fields);
        focusFirstError(fields);
      } else {
        setSendError(err?.status === 429 || err?.status === 401 ? err.message : SEND_ERROR);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Calcular número de reseñas y media
  const reviewsCount = reviews.length;
  const reviewsAvg = reviewsCount > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewsCount).toFixed(2) : '0.00';

  // Presentación: una sola forma para tarjetas y huella de voces
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

  const hasReviews = !loading && !loadError && items.length > 0;
  const ownReview = items.find(r => r.mine);

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
                error={sendError}
                fieldErrors={fieldErrors}
                success={success}
                ownReview={ownReview}
                onShowOwn={revealCard}
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
              error={loadError}
              activeId={activeId}
              onActivate={activate}
              onDeactivate={deactivate}
            >
              <ReviewsEmptyState />
            </ReviewList>
          </div>

          {hasReviews && (
            <aside aria-label="Huella de voces" className="hidden lg:col-span-4 lg:block">
              <figure className="sticky top-32">
                <span className="mb-5 block font-mono text-xs uppercase tracking-[0.18em] text-brand-200/80">
                  {VOICES.label(Math.min(items.length, MAX_VOICES))}
                </span>
                <ReviewsVoiceprint reviews={items} activeId={activeId} onActivate={activate} onDeactivate={deactivate} onSelect={revealCard} />
                <figcaption className="mt-5 max-w-xs text-sm text-ink-2">
                  {VOICES.hint}
                  {items.length > MAX_VOICES && VOICES.more(MAX_VOICES)}
                </figcaption>
              </figure>
            </aside>
          )}
        </div>
      </motion.div>
    </div>
  );
}
