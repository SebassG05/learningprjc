import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { temarioLink } from '../components/curso/temas/temarioPdf';

/**
 * Pestaña del temario en móvil y tableta: pide con la sesión un enlace de corta duración (60 s) y reemplaza
 * la página por el PDF servido por el backend, que comprueba la cohorte y lo abre el visor nativo del
 * sistema (iOS, Android). Los visores embebidos en un <iframe> fallan en iOS. Sin acceso, a la ficha.
 */
export default function TemarioPdf() {
  const { cursoId, materialId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    temarioLink(cursoId, materialId, ctrl.signal)
      .then((url) => window.location.replace(url))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (err.status === 401 || err.status === 403) navigate(`/curso/${cursoId}/inscripcion`, { replace: true });
        else setError(true);
      });
    return () => ctrl.abort();
  }, [cursoId, materialId, navigate]);

  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center gap-4 px-6 text-center">
      {error ? (
        <>
          <AlertCircle className="h-8 w-8 text-danger" aria-hidden="true" />
          <p role="alert" className="text-callout text-ink">No se ha podido cargar el temario.</p>
          <button type="button" onClick={() => window.location.reload()} className="h-11 rounded-full bg-white/[0.08] px-5 text-callout font-semibold text-ink ring-1 ring-inset ring-line-strong">
            Reintentar
          </button>
        </>
      ) : (
        <div role="status" className="flex flex-col items-center gap-4 text-ink-2">
          <span aria-hidden="true" className="h-10 w-10 animate-spin rounded-full border-2 border-line-strong border-t-brand" />
          <span className="text-callout">Abriendo el temario…</span>
        </div>
      )}
    </div>
  );
}
