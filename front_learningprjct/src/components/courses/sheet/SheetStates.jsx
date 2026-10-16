/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { RotateCcw, SearchX } from 'lucide-react';
import Button from '../../ui/Button';
import { SHEET, STATES } from '../coursesCopy';

// Esqueleto con la forma de la portada (misma altura): nada salta al llegar el curso
export function SheetSkeleton() {
  return (
    <div role="status" aria-live="polite" className="mx-auto flex min-h-[calc(100svh-var(--spacing-header))] w-full max-w-site flex-col justify-center px-gutter pb-12 pt-8 lg:min-h-[min(90svh,58rem)] lg:justify-end lg:pb-20">
      <span className="sr-only">{SHEET.loading}</span>
      <div aria-hidden="true" className="space-y-5 motion-safe:animate-pulse">
        <div className="h-4 w-40 rounded-md bg-surface-2" />
        <div className="h-3 w-56 rounded-md bg-surface-2" />
        <div className="h-12 w-11/12 max-w-3xl rounded-xl bg-surface-2 sm:h-16" />
        <div className="h-12 w-2/3 max-w-xl rounded-xl bg-surface-2 sm:h-16" />
        <div className="h-5 w-full max-w-2xl rounded-md bg-surface-2" />
        <div className="flex gap-2 pt-3">
          {['w-20', 'w-24', 'w-28'].map((w) => <div key={w} className={`h-8 ${w} rounded-full bg-surface-2`} />)}
        </div>
        <div className="h-14 w-44 rounded-full bg-surface-2" />
      </div>
    </div>
  );
}

export function SheetMessage({ kind, onRetry }) {
  const notFound = kind === 'notfound';
  const Icon = notFound ? SearchX : RotateCcw;
  return (
    <div className="mx-auto flex min-h-[calc(100svh-var(--spacing-header))] w-full max-w-site flex-col items-center justify-center gap-4 px-gutter py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="text-title-2 font-bold text-ink">{notFound ? SHEET.notFoundTitle : SHEET.errorTitle}</h1>
      <p className="max-w-md text-callout text-ink-2">{notFound ? SHEET.notFoundLead : STATES.errorLead}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {notFound ? null : <Button variant="secondary" onClick={onRetry}>{STATES.retry}</Button>}
        <Button to="/cursos" variant={notFound ? 'primary' : 'ghost'}>{SHEET.backToList}</Button>
      </div>
    </div>
  );
}
