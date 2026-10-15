import { useEffect } from 'react';

// Título y descripción de la ruta; se restauran al salir
export default function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    let meta = document.querySelector('meta[name="description"]');
    const created = !meta;
    if (created) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    const prevDescription = meta.getAttribute('content');
    document.title = title;
    meta.setAttribute('content', description);
    return () => {
      document.title = prevTitle;
      if (created) meta.remove();
      else meta.setAttribute('content', prevDescription ?? '');
    };
  }, [title, description]);
}
