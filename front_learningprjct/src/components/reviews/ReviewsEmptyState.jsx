// Sin reseñas: la huella de voces en silencio (línea plana y un cursor), una invitación a publicar y
// algo para quien solo viene a mirar: los cursos.
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import ReviewsVoiceprint from './ReviewsVoiceprint';
import { EMPTY } from './reviewsCopy';

export default function ReviewsEmptyState() {
  return (
    <div className="flex flex-col items-center gap-8 py-6 text-center sm:py-10">
      <figure className="w-full max-w-md">
        <ReviewsVoiceprint waiting />
        <figcaption className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-brand-200/80">{EMPTY.waiting}</figcaption>
      </figure>
      <div className="flex max-w-md flex-col items-center gap-3">
        <p className="font-display text-title-2 font-bold text-ink">{EMPTY.title}</p>
        <p className="text-base text-ink-2">{EMPTY.body}</p>
      </div>
      <Button variant="secondary" to="/cursos">
        {EMPTY.cta}
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </Button>
    </div>
  );
}
