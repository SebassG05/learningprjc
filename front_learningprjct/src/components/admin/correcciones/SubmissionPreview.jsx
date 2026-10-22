/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo, useEffect, useRef, useState } from 'react';
import { Download, ExternalLink, FileX2 } from 'lucide-react';
import Skeleton from '../ui/Skeleton';
import { focusRing } from '../ui/tones';
import { loadSubmissionFile } from '../../../lib/courseFiles';
import { COPY } from './correccionesCopy';

const linkClass = `inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-white/[0.04] px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-white/[0.08] active:scale-[0.97] ${focusRing}`;

/**
 * PDF de la entrega. En escritorio se incrusta (se carga solo al abrir el panel); en móvil los
 * visores incrustados no funcionan bien, así que se ofrece abrirlo en el visor del sistema.
 */
// El PDF ya no es un archivo público: se pide con la sesión y se muestra desde una URL blob: local
function useSubmissionFile(entrega) {
  const [state, setState] = useState({ status: 'loading', url: null });
  const id = entrega?._id;
  const hasFile = Boolean(entrega?.archivoPdf?.url);
  useEffect(() => {
    if (!id || !hasFile) {
      setState({ status: 'none', url: null });
      return undefined;
    }
    const ctrl = new AbortController();
    let blobUrl = null;
    setState({ status: 'loading', url: null });
    loadSubmissionFile(id, ctrl.signal)
      .then(({ url }) => {
        blobUrl = url;
        setState({ status: 'ready', url });
      })
      .catch((err) => err.name !== 'AbortError' && setState({ status: 'none', url: null }));
    return () => {
      ctrl.abort();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [id, hasFile]);
  return state;
}

const SubmissionPreview = memo(function SubmissionPreview({ entrega, studentLabel, inline }) {
  const file = useSubmissionFile(entrega);
  const url = file.url;
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef(null);
  const lastFocus = useRef(null);

  // El visor de PDF del navegador se queda el foco al cargar: se devuelve a donde estaba
  // (si no, las teclas irían al PDF en vez de a la nota y los atajos dejarían de funcionar)
  useEffect(() => {
    if (!inline) return undefined;
    const onFocusIn = (e) => {
      if (e.target !== frameRef.current) lastFocus.current = e.target;
    };
    document.addEventListener('focusin', onFocusIn);
    lastFocus.current = document.activeElement;
    return () => document.removeEventListener('focusin', onFocusIn);
  }, [inline]);

  const onFrameLoad = () => {
    setLoaded(true);
    const restore = () => {
      if (document.activeElement === frameRef.current && lastFocus.current?.isConnected) lastFocus.current.focus({ preventScroll: true });
    };
    restore();
    setTimeout(restore, 150);
  };

  if (file.status === 'loading') return <Skeleton className={inline ? 'h-[min(70svh,48rem)] rounded-2xl' : 'h-11 w-56 rounded-full'} />;

  if (!url) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line-strong p-4 text-callout text-ink-2">
        <FileX2 className="h-5 w-5 shrink-0 text-ink-3" aria-hidden="true" />
        {COPY.drawer.noFile}
      </div>
    );
  }

  const name = entrega.archivoPdf?.nombreOriginal;
  return (
    <div className="space-y-3">
      {inline ? (
        <div className="relative h-[min(70svh,48rem)] overflow-hidden rounded-2xl border border-line bg-surface-2">
          {loaded ? null : <Skeleton className="absolute inset-3 h-auto rounded-xl" />}
          <iframe
            src={url}
            title={COPY.drawer.previewTitle(studentLabel)}
            ref={frameRef}
            loading="lazy"
            onLoad={onFrameLoad}
            className={`relative h-full w-full transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          {COPY.drawer.openPdf}
        </a>
        <a href={url} download={name || true} className={linkClass}>
          <Download className="h-4 w-4" aria-hidden="true" />
          {COPY.drawer.downloadPdf}
        </a>
        {name ? <span className="min-w-0 truncate text-footnote text-ink-3">{name}</span> : null}
      </div>
    </div>
  );
});

export default SubmissionPreview;
