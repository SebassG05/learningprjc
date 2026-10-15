/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Formulario de nueva reseña (solo presentación). Los datos, la validación y el envío siguen en la
// página: aquí llegan como props. Mismos campos (`description`, `rating`), mismas reglas: el botón se
// habilita con ambos rellenos. El error general se anuncia (role="alert") con un desplazamiento leve.
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import TextAreaField from '../contact/TextAreaField';
import SubmitButton from '../auth/SubmitButton';
import StarRatingInput from './StarRatingInput';
import ReviewSent from './ReviewSent';
import { COMPOSER } from './reviewsCopy';
import { nudge } from '../../lib/motion';

export default function ReviewComposer({ user, form, onTextChange, onRate, onSubmit, submitting, error, success }) {
  const reduce = useReducedMotion();
  const incomplete = !form.description || !form.rating;

  return (
    <form onSubmit={onSubmit} aria-labelledby="composer-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">{COMPOSER.eyebrow}</p>
        <h2 id="composer-title" className="font-display text-title-2 font-bold text-ink">
          {COMPOSER.title}
        </h2>
        <p className="min-w-0 break-words [overflow-wrap:anywhere] text-sm text-ink-2">
          {COMPOSER.as} <span className="font-semibold text-ink">{user.name || user.email}</span>
          {user.name && user.email && <span className="text-ink-3"> · {user.email}</span>}
        </p>
      </div>

      <StarRatingInput
        id="review-rating"
        legend={COMPOSER.rating}
        hint={COMPOSER.ratingHint}
        value={form.rating}
        onChange={onRate}
        disabled={submitting}
      />

      <TextAreaField
        id="review-description"
        name="description"
        label={COMPOSER.text}
        value={form.description}
        onChange={onTextChange}
        placeholder={COMPOSER.placeholder}
        required
        readOnly={submitting}
      />

      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            key={error}
            role="alert"
            className="flex items-start gap-2 text-sm text-danger"
            initial={{ opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, ...nudge }}
            exit={{ opacity: 0 }}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        <SubmitButton loading={submitting} loadingText={COMPOSER.sending} disabled={incomplete} aria-describedby={incomplete ? 'composer-incomplete' : undefined}>
          {COMPOSER.submit}
        </SubmitButton>
        {incomplete && (
          <p id="composer-incomplete" className="text-center text-sm text-ink-3">
            {COMPOSER.incomplete}
          </p>
        )}
      </div>

      <AnimatePresence>{success && <ReviewSent message={COMPOSER.success} />}</AnimatePresence>
    </form>
  );
}
