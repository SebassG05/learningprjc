import { useEffect } from 'react';

// <meta name="robots" content="noindex"> mientras la ruta está montada (páginas de error)
export default function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'robots');
    meta.setAttribute('content', 'noindex');
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}
