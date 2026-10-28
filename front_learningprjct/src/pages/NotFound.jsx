import { useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import OrbitScene from '../components/notFound/OrbitScene';
import NotFoundSearch from '../components/notFound/NotFoundSearch';
import { COPY, MAX_PATH_SHOWN, PAGE_DESCRIPTION, PAGE_TITLE } from '../components/notFound/notFoundCopy';
import usePageMeta from '../hooks/usePageMeta';
import useNoIndex from '../hooks/useNoIndex';

// Ruta comodín. El código 404 de verdad lo pone el servidor (vite/notFoundStatus.js en local y
// deploy/nginx-404.conf en producción); esto es solo lo que se ve.
export default function NotFound() {
  usePageMeta(PAGE_TITLE, PAGE_DESCRIPTION);
  useNoIndex();
  const { pathname } = useLocation();
  const path = decodeURIComponent(pathname);
  const shown = path.length > MAX_PATH_SHOWN ? `${path.slice(0, MAX_PATH_SHOWN)}…` : path;

  return (
    <section className="mx-auto flex min-h-[calc(100svh-var(--spacing-header))] w-full max-w-site flex-col items-center justify-center gap-[clamp(1.5rem,4vw,3rem)] px-gutter py-[clamp(2rem,6vw,5rem)] text-center">
      <OrbitScene />

      <div className="flex max-w-2xl flex-col items-center gap-[clamp(0.75rem,2vw,1.25rem)]">
        <p className="eyebrow">{COPY.eyebrow}</p>
        <h1 className="text-balance font-display text-title-1 font-bold">{COPY.title}</h1>
        <p className="text-pretty text-base text-ink-2">
          {COPY.before} <code className="break-all rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-callout text-ink">{shown}</code>
          {COPY.after}
        </p>
      </div>

      <nav aria-label={COPY.actions} className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <Button to="/" size="lg">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {COPY.home}
        </Button>
        <Button to="/cursos" variant="secondary" size="lg">{COPY.courses}</Button>
        <Button to="/contacto" variant="ghost" size="lg">{COPY.support}</Button>
      </nav>

      <div className="w-full max-w-md">
        <NotFoundSearch />
      </div>
    </section>
  );
}
