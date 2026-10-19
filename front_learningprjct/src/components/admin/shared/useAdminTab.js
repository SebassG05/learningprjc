import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ADMIN_TABS, DEFAULT_TAB } from './adminTabs';

const KEYS = new Set(ADMIN_TABS.map((t) => t.key));

/**
 * Pestaña activa del panel guardada en la URL (?tab=reservas), así sobrevive a una recarga y se
 * puede compartir. Cambiar de pestaña reemplaza la entrada del historial y descarta los filtros
 * de la anterior (cada pestaña lleva los suyos en la URL).
 */
export default function useAdminTab() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab = KEYS.has(raw) ? raw : DEFAULT_TAB;

  const setTab = useCallback(
    (key) => {
      if (!KEYS.has(key)) return;
      setParams(key === DEFAULT_TAB ? {} : { tab: key }, { replace: true });
    },
    [setParams]
  );

  return [tab, setTab];
}
