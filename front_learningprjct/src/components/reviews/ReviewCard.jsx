/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Tarjeta de reseña. El texto manda; la puntuación, el autor y la fecha lo acompañan.
// Enlazada a su barra de la huella de voces: al pasar o enfocar la tarjeta se ilumina su barra y al
// revés (estado `active`). El brillo es una capa aparte que solo cambia de opacidad.
import { memo } from 'react';
import StarRating from './StarRating';
import { formatFullDate, formatRelativeDate, starsLabel } from './reviewFormat';
import { LATEST, NO_TEXT } from './reviewsCopy';

const AVATAR_TONES = [
  'bg-brand-400/15 text-brand-200',
  'bg-night-teal text-brand-100',
  'bg-surface-3 text-ink',
  'bg-brand-800/50 text-brand-100',
];

function Avatar({ initials, tone }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold tracking-wide ring-1 ring-white/10 ${AVATAR_TONES[tone]}`}
    >
      {initials}
    </span>
  );
}

function ReviewCard({ review, featured = false, active = false, linked = false, onActivate, onDeactivate }) {
  const { id, name, initials, tone, rating, text, date } = review;
  // Destacada: cita grande en display si es breve; si es larga, cuerpo amplio y legible
  const quote = featured && text.length <= 180;
  const enter = linked ? () => onActivate(id) : undefined;
  const leave = linked ? () => onDeactivate(id) : undefined;

  return (
    <article
      id={`review-${id}`}
      tabIndex={0}
      aria-labelledby={`review-${id}-author`}
      data-active={active || undefined}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocus={enter}
      onBlur={leave}
      className={`group/card relative isolate scroll-mt-28 rounded-3xl outline-none transition-transform duration-300 ease-out-expo focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas data-active:-translate-y-0.5 motion-reduce:data-active:translate-y-0 ${
        featured ? 'p-7 sm:p-10' : 'p-6 sm:p-7'
      }`}
    >
      {/* Superficie: la destacada lleva una sola capa; el resto son entradas editoriales con un filete */}
      {featured ? (
        <span aria-hidden="true" className="absolute inset-0 -z-10 rounded-3xl bg-white/[0.035] ring-1 ring-inset ring-line" />
      ) : (
        <span aria-hidden="true" className="absolute inset-x-6 top-0 h-px bg-line-strong sm:inset-x-7" />
      )}
      {/* Brillo enlazado con su barra: aparece solo al activarse (opacidad) */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-3xl bg-white/[0.04] opacity-0 shadow-glow transition-opacity duration-300 ease-out-expo group-data-active/card:opacity-100"
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StarRating value={rating} label={starsLabel(rating)} size={featured ? 'h-5 w-5' : 'h-4 w-4'} />
          {featured && <span className="eyebrow">{LATEST}</span>}
        </div>
        {linked && (
          // Su barra en miniatura (solo donde se ve la huella de voces)
          <span aria-hidden="true" className="relative hidden h-4 w-1 lg:block">
            <span className="absolute inset-0 rounded-full bg-ink-3/60 transition-opacity duration-300 group-data-active/card:opacity-0" />
            <span className="absolute inset-0 rounded-full bg-brand-300 opacity-0 transition-opacity duration-300 group-data-active/card:opacity-100" />
          </span>
        )}
      </div>

      {text ? (
        <p
          className={`mt-5 max-w-[65ch] whitespace-pre-line break-words [overflow-wrap:anywhere] text-ink ${
            quote ? 'font-display text-title-2 font-bold' : featured ? 'text-xl leading-relaxed sm:text-2xl sm:leading-relaxed' : 'text-lg leading-relaxed'
          }`}
        >
          {text}
        </p>
      ) : (
        <p className="mt-5 text-base text-ink-3 italic">{NO_TEXT}</p>
      )}

      <footer className={`flex items-center gap-3 ${featured ? 'mt-8' : 'mt-6'}`}>
        <Avatar initials={initials} tone={tone} />
        <div className="min-w-0">
          <h3 id={`review-${id}-author`} className="line-clamp-2 break-words [overflow-wrap:anywhere] font-sans text-sm font-semibold text-ink">
            <span className="sr-only">Reseña de </span>
            {name}
          </h3>
          {date && (
            <time dateTime={date.toISOString()} title={formatFullDate(date)} className="text-sm text-ink-3">
              {formatRelativeDate(date)}
            </time>
          )}
        </div>
      </footer>
    </article>
  );
}

export default memo(ReviewCard);
