/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Panel cuando ya has publicado hoy (una reseña cada 24 h): cuándo podrás escribir la siguiente y tu
// última reseña tal cual sale en el muro, con Editar y Borrar.
import { Clock } from 'lucide-react';
import Button from '../ui/Button';
import StarRating from './StarRating';
import OwnActions from './OwnActions';
import { formatFullDate, formatNextTime, formatRelativeDate, starsLabel } from './reviewFormat';
import { OWN } from './reviewsCopy';

export default function OwnReview({ review, nextReviewAt, onShow, actions }) {
  return (
    <section aria-labelledby="composer-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">{OWN.eyebrow}</p>
        <h2 id="composer-title" tabIndex={-1} className="font-display text-title-2 font-bold text-ink outline-none">
          {OWN.cooldownTitle}
        </h2>
        <p className="flex items-start gap-2 text-base text-gray-200">
          <Clock className="mt-1 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
          <span>
            {OWN.cooldownBody}{' '}
            <time dateTime={nextReviewAt.toISOString()} className="font-semibold text-ink">
              {formatNextTime(nextReviewAt)}
            </time>
            .
          </span>
        </p>
      </div>

      {review && (
        <>
          <figure className="flex flex-col gap-3 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-inset ring-line">
            <figcaption className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">{OWN.latest}</figcaption>
            <StarRating value={review.rating} label={starsLabel(review.rating)} size="h-5 w-5" />
            <blockquote className="line-clamp-5 whitespace-pre-line break-words [overflow-wrap:anywhere] text-base text-ink">{review.text}</blockquote>
            {review.date && (
              <p className="text-sm text-ink-2">
                <time dateTime={review.date.toISOString()} title={formatFullDate(review.date)}>
                  {formatRelativeDate(review.date)}
                </time>
                {review.edited && ` · ${OWN.edited}`}
              </p>
            )}
          </figure>
          <OwnActions review={review} actions={actions} scope="panel">
            <Button variant="link" className="ml-auto text-sm" onClick={() => onShow(review.id)}>
              {OWN.show}
            </Button>
          </OwnActions>
        </>
      )}
    </section>
  );
}
