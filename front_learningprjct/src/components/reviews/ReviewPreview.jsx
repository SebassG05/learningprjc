/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// "Así se verá tu reseña": mientras escribes, la tarjeta tal cual saldrá en el muro. Solo lee el
// estado del formulario; es un espejo visual (aria-hidden e inert), el formulario ya lo dice todo.
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ReviewCard from './ReviewCard';
import { initialsOf, toneOf } from './reviewFormat';
import { PREVIEW } from './reviewsCopy';
import { duration, ease, spring } from '../../lib/motion';

export default function ReviewPreview({ user, form, className = '' }) {
  const reduce = useReducedMotion();
  const show = Boolean(user && (form.rating || form.description.trim()));
  const name = user?.name || user?.email || '';
  const review = {
    id: 'preview',
    name,
    initials: initialsOf(name || '·'),
    tone: toneOf(name),
    rating: form.rating,
    text: form.description.trim(),
    date: new Date(),
    mine: true,
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden="true"
          inert=""
          className={className}
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0, transition: reduce ? { duration: duration.fast } : spring.gentle }}
          exit={{ opacity: 0, transition: { duration: duration.fast, ease: ease.exit } }}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-brand-200/80">{PREVIEW}</p>
          <div className="rounded-3xl outline-1 outline-dashed outline-offset-4 outline-brand-300/30">
            <ReviewCard review={review} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
