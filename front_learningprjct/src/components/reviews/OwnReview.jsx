/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Tu reseña (una por persona): se ve tal cual sale en el muro, con Editar y Borrar. Borrar pide
// confirmación en el propio panel (sin diálogo del navegador) y devuelve el foco a donde estaba.
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import StarRating from './StarRating';
import { formatFullDate, formatRelativeDate, starsLabel } from './reviewFormat';
import { OWN } from './reviewsCopy';
import { disclose } from '../../lib/motion';

export default function OwnReview({ review, onShow, onEdit, onAskDelete, onCancelDelete, onConfirmDelete, confirming, deleting }) {
  const { id, rating, text, date, edited } = review;

  return (
    <section aria-labelledby="composer-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">{OWN.eyebrow}</p>
        <h2 id="composer-title" tabIndex={-1} className="font-display text-title-2 font-bold text-ink outline-none">
          {OWN.title}
        </h2>
      </div>

      <figure className="flex flex-col gap-3 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-inset ring-line">
        <StarRating value={rating} label={starsLabel(rating)} size="h-5 w-5" />
        <blockquote className="line-clamp-5 whitespace-pre-line break-words [overflow-wrap:anywhere] text-base text-ink">{text}</blockquote>
        {date && (
          <figcaption className="text-sm text-ink-3">
            <time dateTime={date.toISOString()} title={formatFullDate(date)}>
              {formatRelativeDate(date)}
            </time>
            {edited && ` · ${OWN.edited}`}
          </figcaption>
        )}
      </figure>

      {/* Cambio inmediato (sin esperar a una salida) para que el foco llegue a su sitio */}
      {confirming ? (
          <motion.div key="confirm" initial={disclose.initial} animate={disclose.animate} role="group" aria-labelledby="own-review-confirm" className="flex flex-col gap-4">
            <p id="own-review-confirm" className="text-base font-semibold text-ink">
              {OWN.confirm}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                className="border-danger/50! text-danger hover:bg-danger/10!"
                onClick={onConfirmDelete}
                disabled={deleting}
                aria-busy={deleting || undefined}
              >
                <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                {deleting ? OWN.deleting : OWN.confirmYes}
              </Button>
              <Button id="own-review-cancel-delete" variant="ghost" onClick={onCancelDelete} disabled={deleting}>
                {OWN.cancel}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="actions" initial={false} animate={disclose.animate} className="flex flex-wrap items-center gap-3">
            <Button id="own-review-edit" variant="secondary" onClick={onEdit}>
              <Pencil className="h-4 w-4 shrink-0" aria-hidden="true" />
              {OWN.edit}
            </Button>
            <Button id="own-review-delete" variant="ghost" onClick={onAskDelete}>
              <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              {OWN.delete}
            </Button>
            <Button variant="link" className="ml-auto text-sm" onClick={() => onShow(id)}>
              {OWN.show}
            </Button>
          </motion.div>
      )}
    </section>
  );
}
