import { useEffect, useState } from 'react';

// Solo en desarrollo y con ?demo=reviews (&n=1…40, por defecto 20): devuelve reseñas de ejemplo para
// ver la página llena. En producción import.meta.env.DEV es false: el efecto sale al instante y el
// import() de los datos desaparece del build.
export default function useDemoReviews() {
  const [demo, setDemo] = useState(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') !== 'reviews') return;
    const count = Math.min(40, Math.max(0, Number(params.get('n') ?? 20) || 0));
    import('./__fixtures__/demoReviews').then((m) => setDemo(m.default(count)));
  }, []);

  return demo;
}
