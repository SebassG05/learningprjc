/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useRef } from 'react';
import Button from '../../ui/Button';

/**
 * Final de un listado con scroll infinito: carga la página siguiente al acercarse y deja un botón
 * visible (teclado, lectores de pantalla o si el observador no está disponible).
 */
export default function LoadMore({ hasMore, loading, onLoad, label = 'Cargar más', loadingLabel = 'Cargando…' }) {
  const ref = useRef(null);
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  // Se vuelve a observar al terminar cada carga: si el final sigue a la vista (pantallas altas o
  // scroll rápido), el observador avisa de nuevo y se pide la página siguiente
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore || loading || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && onLoadRef.current(), { rootMargin: '400px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading]);

  if (!hasMore) return null;
  return (
    <div ref={ref} className="mt-4 flex justify-center">
      <Button variant="secondary" onClick={onLoad} disabled={loading} aria-busy={loading || undefined}>
        {loading ? loadingLabel : label}
      </Button>
    </div>
  );
}
