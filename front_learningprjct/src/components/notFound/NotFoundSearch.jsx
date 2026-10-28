import { useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Button from '../ui/Button';
import { COPY } from './notFoundCopy';

// Búsqueda en el catálogo: lleva a /cursos?q=…, el mismo parámetro que lee el filtro de Cursos.
// Es un formulario GET real, así que también funciona si el JS no llega a cargar.
export default function NotFoundSearch() {
  const id = useId();
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q').trim();
    navigate(q ? `/cursos?q=${encodeURIComponent(q)}` : '/cursos');
  };

  return (
    <form role="search" action="/cursos" method="get" onSubmit={onSubmit} className="w-full">
      <label htmlFor={id} className="mb-2 block text-callout text-ink-2">{COPY.searchLabel}</label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            id={id}
            name="q"
            type="search"
            placeholder={COPY.searchPlaceholder}
            enterKeyHint="search"
            autoComplete="off"
            className="h-11 w-full rounded-full border border-line bg-surface-2 pl-10 pr-4 text-callout text-ink placeholder:text-ink-3 focus:border-brand-400/60"
          />
        </div>
        <Button type="submit" variant="secondary" className="shrink-0">{COPY.searchSubmit}</Button>
      </div>
    </form>
  );
}
