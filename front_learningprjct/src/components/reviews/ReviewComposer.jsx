/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Panel "Tu turno" (solo presentación; el estado llega de useReviewForm). Una reseña por persona:
// sin reseña, el formulario para escribirla; con ella, la reseña propia con Editar y Borrar; al
// editar, el mismo formulario relleno. Los errores del servidor van junto a su campo
// (aria-invalid / aria-describedby); el general se anuncia (role="alert") con un desplazamiento leve.
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import TextAreaField from '../ui/TextAreaField';
import Button from '../ui/Button';
import SubmitButton from '../auth/SubmitButton';
import StarRatingInput from './StarRatingInput';
import ReviewSent from './ReviewSent';
import OwnReview from './OwnReview';
import { COMPOSER, OWN } from './reviewsCopy';
import { MAX_TEXT } from './reviewFormat';
import { nudge } from '../../lib/motion';

function GeneralError({ error }) {
  const reduce = useReducedMotion();
  return (
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
  );
}

export default function ReviewComposer({ user, ownReview, onShowOwn, state }) {
  const { form, fieldErrors, sendError, submitting, success, editing, confirming, deleting } = state;
  const incomplete = !form.description || !form.rating;
  const length = form.description.length;
  const nearLimit = length > MAX_TEXT * 0.8;
  // Éxito de publicar o guardar: momento grande; al borrar, solo un aviso
  const celebrate = success && success !== OWN.deleted;

  if (ownReview && !editing) {
    return (
      <div className="flex flex-col gap-4">
        <OwnReview
          review={ownReview}
          onShow={onShowOwn}
          onEdit={state.startEdit}
          onAskDelete={state.askDelete}
          onCancelDelete={state.cancelDelete}
          onConfirmDelete={state.confirmDelete}
          confirming={confirming}
          deleting={deleting}
        />
        <GeneralError error={sendError} />
        <AnimatePresence>{celebrate && <ReviewSent message={success} />}</AnimatePresence>
      </div>
    );
  }

  return (
    <form onSubmit={state.onSubmit} aria-labelledby="composer-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">{editing ? OWN.eyebrow : COMPOSER.eyebrow}</p>
        <h2 id="composer-title" tabIndex={-1} className="font-display text-title-2 font-bold text-ink outline-none">
          {editing ? OWN.editTitle : COMPOSER.title}
        </h2>
        <p className="min-w-0 break-words [overflow-wrap:anywhere] text-sm text-ink-2">
          {editing ? OWN.as : COMPOSER.as} <span className="font-semibold text-ink">{user.name || user.email}</span>
          {user.name && user.email && <span className="text-ink-3"> · {user.email}</span>}
        </p>
        {success === OWN.deleted && (
          <p role="status" className="text-sm text-brand-200">
            {success}
          </p>
        )}
      </div>

      <StarRatingInput
        id="review-rating"
        legend={COMPOSER.rating}
        hint={COMPOSER.ratingHint}
        value={form.rating}
        onChange={state.onRate}
        disabled={submitting}
        error={fieldErrors.rating}
      />

      <TextAreaField
        id="review-description"
        name="description"
        label={COMPOSER.text}
        value={form.description}
        onChange={state.onTextChange}
        placeholder={COMPOSER.placeholder}
        required
        maxLength={MAX_TEXT}
        readOnly={submitting}
        error={fieldErrors.description}
      />
      {nearLimit && (
        <p className="-mt-4 text-right text-sm tabular-nums text-ink-2" aria-live="polite">
          {COMPOSER.count(length, MAX_TEXT)}
        </p>
      )}

      <GeneralError error={sendError} />

      <div className="flex flex-col gap-3">
        <SubmitButton
          loading={submitting}
          loadingText={editing ? OWN.saving : COMPOSER.sending}
          disabled={incomplete}
          aria-describedby={incomplete ? 'composer-incomplete' : undefined}
        >
          {editing ? OWN.save : COMPOSER.submit}
        </SubmitButton>
        {editing && (
          <Button type="button" variant="ghost" onClick={state.cancelEdit} disabled={submitting}>
            {OWN.cancel}
          </Button>
        )}
        {incomplete && (
          <p id="composer-incomplete" className="text-center text-sm text-ink-3">
            {COMPOSER.incomplete}
          </p>
        )}
      </div>

      <AnimatePresence>{celebrate && <ReviewSent message={success} />}</AnimatePresence>
    </form>
  );
}
