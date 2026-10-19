import { useCallback, useState } from 'react';
import { DEFAULT_TEMPLATES } from './correccionesCopy';

const KEY = 'admin.feedbackTemplates';

const read = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list.filter((t) => typeof t === 'string') : [];
  } catch {
    return [];
  }
};

/**
 * Comentarios rápidos: los predefinidos más los que guarda el profesor (en este navegador).
 * Si el almacenamiento no está disponible, siguen funcionando los predefinidos.
 */
export default function useFeedbackTemplates() {
  const [custom, setCustom] = useState(read);

  const persist = (list) => {
    setCustom(list);
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      /* sin almacenamiento: la plantilla dura lo que la sesión */
    }
  };

  const add = useCallback((text) => {
    const t = text.trim();
    if (!t || DEFAULT_TEMPLATES.includes(t)) return;
    persist([...read().filter((x) => x !== t), t].slice(-12));
  }, []);

  const remove = useCallback((text) => persist(read().filter((x) => x !== text)), []);

  return { defaults: DEFAULT_TEMPLATES, custom, add, remove };
}
