/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, SearchX } from 'lucide-react';
import Button from '../ui/Button';
import { duration, ease, inView } from '../../lib/motion';
import CourseCard from './CourseCard';
import { STATES } from './coursesCopy';
import { areaLabel } from './courseFormat';

const GRID = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4';

// Entrada solo con transform: la tarjeta es visible desde el primer frame (no retrasa el LCP).
// Al filtrar, las que quedan se recolocan con `layout` (transform) y las que salen se funden.
const rise = (i) => ({
  layout: 'position',
  initial: { y: 28 },
  whileInView: { y: 0 },
  viewport: inView,
  exit: { opacity: 0, scale: 0.96, transition: { duration: duration.fast, ease: ease.exit } },
  transition: { duration: 0.7, ease: ease.outExpo, delay: (i % 4) * 0.06, layout: { type: 'spring', stiffness: 380, damping: 36 } },
});

// Esqueleto con la forma exacta de la tarjeta: nada salta al llegar los datos (CLS 0)
function CardSkeleton() {
  return (
    <li className="overflow-hidden rounded-3xl border border-line bg-surface" aria-hidden="true">
      <div className="aspect-[16/10] bg-surface-2" />
      <div className="space-y-3 p-6 motion-safe:animate-pulse">
        <div className="h-3 w-28 rounded-md bg-surface-3" />
        <div className="h-5 w-11/12 rounded-md bg-surface-3" />
        <div className="h-5 w-2/3 rounded-md bg-surface-3" />
        <div className="h-3.5 w-full rounded-md bg-surface-3" />
        <div className="h-3.5 w-3/4 rounded-md bg-surface-3" />
        <div className="!mt-6 border-t border-line pt-4">
          <div className="h-3.5 w-40 rounded-md bg-surface-3" />
        </div>
      </div>
    </li>
  );
}

function Message({ icon: Icon, title, lead, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-line px-6 py-20 text-center">
      {Icon ? (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      ) : null}
      <h2 className="max-w-xl text-title-3 font-semibold text-ink">{title}</h2>
      {lead ? <p className="max-w-md text-callout text-ink-2">{lead}</p> : null}
      {action}
    </div>
  );
}

export default function CourseGrid({ status, courses, total, catalog, progress, query, hasFilters, onClear, onRetry, hasMore, onMore }) {
  if (status === 'loading') {
    return (
      <div role="status" aria-live="polite">
        <span className="sr-only">{STATES.loading}</span>
        <ul className={GRID}>
          {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
        </ul>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Message
        icon={RotateCcw}
        title={STATES.errorTitle}
        lead={STATES.errorLead}
        action={<Button variant="secondary" onClick={onRetry}>{STATES.retry}</Button>}
      />
    );
  }

  if (total === 0) return <Message title={STATES.noneTitle} lead={STATES.noneLead} />;

  if (courses.length === 0) {
    return (
      <Message
        icon={SearchX}
        title={STATES.emptyTitle(query.trim())}
        lead={STATES.emptyLead}
        action={hasFilters ? <Button variant="secondary" onClick={onClear}>{STATES.clearFilters}</Button> : null}
      />
    );
  }

  return (
    <>
      <ul className={GRID}>
        <AnimatePresence mode="popLayout" initial={false}>
        {courses.map((course, i) => (
          <motion.li key={course._id} {...rise(i)} className="h-full">
            <CourseCard
              course={course}
              areaName={areaLabel(catalog, course.area)}
              progress={progress.get(String(course._id))}
              eager={i < 3}
              priority={i === 0}
            />
          </motion.li>
        ))}
        </AnimatePresence>
      </ul>
      {hasMore ? (
        <div className="mt-12 flex justify-center">
          <Button variant="secondary" size="lg" onClick={onMore}>{STATES.more}</Button>
        </div>
      ) : null}
    </>
  );
}
