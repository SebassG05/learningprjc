import { useState, useMemo, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { motion, useReducedMotion } from 'framer-motion';
import { duration, ease, stagger } from '../lib/motion';
import { glideTo } from '../lib/smoothScroll';
import usePageMeta from '../hooks/usePageMeta';
import useReviews from '../hooks/useReviews';
import useReviewForm from '../components/reviews/useReviewForm';
import useDemoReviews from '../components/reviews/useDemoReviews';
import ReviewsBackdrop from '../components/reviews/ReviewsBackdrop';
import ReviewsHero from '../components/reviews/ReviewsHero';
import ReviewsSummary from '../components/reviews/ReviewsSummary';
import ReviewComposer from '../components/reviews/ReviewComposer';
import ReviewStation from '../components/reviews/ReviewStation';
import ReviewPreview from '../components/reviews/ReviewPreview';
import ReviewInvite from '../components/reviews/ReviewInvite';
import ReviewList from '../components/reviews/ReviewList';
import ReviewsEmptyState from '../components/reviews/ReviewsEmptyState';
import ReviewsVoiceprint, { MAX_VOICES } from '../components/reviews/ReviewsVoiceprint';
import { ratingDistribution, toReviewViewModel } from '../components/reviews/reviewFormat';
import { PAGE_DESCRIPTION, PAGE_TITLE, VOICES } from '../components/reviews/reviewsCopy';

// Abre el mismo diálogo de acceso que el botón del header
const openAuth = () => {
  const authButton = document.querySelector('[data-auth-trigger]');
  if (authButton) authButton.click();
};

export default function ReviewsPage() {
  const { user } = useUser();
  const reduce = useReducedMotion();
  // Con sesión, el servidor marca la reseña propia; se vuelve a pedir al entrar o salir
  const viewer = user ? user._id || user.id || user.email : null;
  const { reviews: loaded, loading, loadError, reload, create, update, remove, nextReviewAt, blockUntil } = useReviews(viewer);
  // Solo en desarrollo (?demo=reviews): reseñas de ejemplo en lugar de las cargadas
  const demo = useDemoReviews();
  const reviews = demo ?? loaded;
  // Tarjeta y su barra de la huella de voces enlazadas (solo presentación)
  const [activeId, setActiveId] = useState(null);

  usePageMeta(PAGE_TITLE, PAGE_DESCRIPTION);

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

  // "Escribir la primera reseña": con sesión, al selector de estrellas; sin ella, al acceso
  const writeFirst = useCallback(() => {
    if (!user) return openAuth();
    const first = document.querySelector('input[name="rating"]');
    if (!first) return;
    glideTo(first.getBoundingClientRect().top + window.scrollY - 200);
    first.focus({ preventScroll: true });
  }, [user]);

  // Entrada escalonada corta; con reduced motion, solo fundido
  const group = { hidden: {}, show: { transition: { staggerChildren: stagger.cards, delayChildren: 0.05 } } };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? duration.fast : duration.scene, ease: ease.outExpo } },
  };

  const hasReviews = !loading && !loadError && items.length > 0;
  const ownReviews = useMemo(() => items.filter(r => r.mine), [items]);
  const composer = useReviewForm({ user, create, update, remove, reload, blockUntil });
  // Acciones de tus tarjetas: objeto estable para no volver a pintar el muro en cada tecla
  const { confirmingId, deleting, startEdit, askDelete, cancelDelete, confirmDelete } = composer;
  const ownActions = useMemo(
    () => ({ confirmingId, deleting, startEdit, askDelete, cancelDelete, confirmDelete }),
    [confirmingId, deleting, startEdit, askDelete, cancelDelete, confirmDelete]
  );

  return (
    <div className="relative isolate min-h-dvh pb-32">
      <ReviewsBackdrop />

      <motion.div variants={group} initial="hidden" animate="show" className="mx-auto w-full max-w-wide px-gutter pt-8 sm:pt-12 lg:pt-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-16 xl:gap-x-24">
          <div className="relative flex flex-col gap-12 lg:col-span-7 lg:gap-16 lg:pt-6">
            <div aria-hidden="true" className="reviews-veil pointer-events-none absolute -inset-x-16 -inset-y-10 -z-10" />
            <motion.div variants={item}>
              <ReviewsHero />
            </motion.div>
            <motion.div variants={item}>
              <ReviewsSummary count={reviewsCount} average={Number(reviewsAvg)} distribution={distribution} loading={loading} />
            </motion.div>
            {/* Escritorio: la vista previa ocupa el hueco junto al formulario */}
            <ReviewPreview user={user} form={composer.form} className="hidden max-w-xl lg:block" />
          </div>

          <motion.div variants={item} className="lg:col-span-5 lg:self-start">
            <ReviewStation rating={user ? composer.form.rating : 0}>
              {user ? (
                <ReviewComposer user={user} ownReviews={ownReviews} nextReviewAt={nextReviewAt} onShowOwn={revealCard} state={composer} />
              ) : (
                <ReviewInvite onAccess={openAuth} />
              )}
            </ReviewStation>
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
              ownActions={user ? ownActions : undefined}
            >
              <ReviewsEmptyState onWrite={writeFirst} />
            </ReviewList>
          </div>

          {hasReviews && (
            <aside aria-label="Huella de voces" className="hidden lg:col-span-4 lg:block">
              <figure className="relative sticky top-32">
                <div aria-hidden="true" className="reviews-halo absolute -inset-x-10 -top-6 -z-10 h-72" />
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
