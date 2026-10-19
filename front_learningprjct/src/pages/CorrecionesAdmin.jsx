import { Suspense, lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import usePageMeta from '../hooks/usePageMeta';
import AdminTabs from '../components/admin/AdminTabs';
import Skeleton from '../components/admin/ui/Skeleton';
import useAdminTab from '../components/admin/shared/useAdminTab';
import { panelId, tabByKey, tabId } from '../components/admin/shared/adminTabs';

// Cada pestaña es un chunk aparte: solo se descarga la que se abre
const PANELS = {
  correcciones: lazy(() => import('../components/admin/correcciones/CorreccionesTab.jsx')),
  reservas: lazy(() => import('../components/admin/reservas/ReservasTab.jsx')),
  progreso: lazy(() => import('../components/admin/progreso/ProgresoTab.jsx')),
  gestion: lazy(() => import('../components/AdminCursos.jsx')),
};

const isAdmin = (user) => user?.role === 'admin' || user?.role === 'superadmin';

function PanelFallback() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton className="h-12 rounded-xl" />
      {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
    </div>
  );
}

// Carcasa del panel de administración: permisos, cabecera, pestañas (en la URL) y panel activo.
export default function CorreccionesAdmin() {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useAdminTab();
  const meta = tabByKey(tab);
  const Panel = PANELS[tab];

  usePageMeta(`${meta.title} · Panel de administración · Campus`, meta.description);

  // Se pinta en cuanto la sesión guardada dice que es admin; solo se expulsa cuando UserContext
  // ha terminado (antes, una carga directa veía user=null un instante y echaba al admin).
  // Si /users/me responde con otro rol, `user` cambia y también se expulsa.
  useEffect(() => {
    if (loading || isAdmin(user)) return;
    showToast('No tienes permisos para acceder a esta página', 'error');
    navigate('/', { replace: true });
  }, [user, loading, navigate, showToast]);

  if (!isAdmin(user)) {
    return <div className="min-h-screen bg-canvas" aria-busy="true" />;
  }

  return (
    <div className="min-h-screen bg-canvas px-4 pb-24 pt-24 sm:px-6 md:pt-28">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 md:mb-8">
          <h1 className="text-title-1 font-bold text-ink">{meta.title}</h1>
          <p className="mt-2 max-w-2xl text-callout text-ink-2">{meta.description}</p>
        </header>

        <AdminTabs value={tab} onChange={setTab} />

        <section
          id={panelId(tab)}
          role="tabpanel"
          aria-labelledby={tabId(tab)}
          tabIndex={-1}
          className="mt-6 outline-none md:mt-8"
        >
          <Suspense fallback={<PanelFallback />}>
            <Panel />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
