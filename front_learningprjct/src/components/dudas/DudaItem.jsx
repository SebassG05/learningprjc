/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useRef, useState } from 'react';
import { Check, EyeOff, Flag, Pin } from 'lucide-react';
import ConfirmDialog from '../admin/ui/ConfirmDialog';
import DudaAcciones from './DudaAcciones';
import DudaForm from './DudaForm';
import DudaRespuesta from './DudaRespuesta';
import { dudasCopy } from './dudasCopy';
import { tiempoRelativo } from './dudasFormat';
import { MARCA, MARCA_ACENTO } from './dudasUi';

/**
 * Una duda con sus respuestas y acciones. `temaTexto` (opcional) rotula el tema de la duda cuando la lista mezcla temas. `onAccion(nombre, ...args)` llama a la acción del hook sobre
 * esta duda y resuelve con algo verdadero si salió bien. Una duda propia con respuesta sin ver lleva
 * «Respuesta nueva» mientras se muestra y se marca como vista al aparecer (una sola vez).
 */
export default function DudaItem({ duda, lang = 'es', puedePublicar = false, onAccion, temaTexto }) {
  const c = dudasCopy(lang);
  const [nueva] = useState(Boolean(duda.mine && duda.respuestaNoVista));
  const [modo, setModo] = useState(null); // null | 'editar' | 'responder'
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const vista = useRef(false);

  useEffect(() => {
    if (vista.current || !duda.mine || !duda.respuestaNoVista) return;
    vista.current = true;
    onAccion('marcarVista');
  }, [duda.mine, duda.respuestaNoVista, onAccion]);

  const confirmar = async () => {
    setBusy(true);
    await confirm.run();
    setBusy(false);
    setConfirm(null);
  };

  const respuestas = duda.respuestas ?? [];
  const titleId = `duda-${duda._id}-titulo`;

  return (
    <li id={`duda-${duda._id}`} aria-labelledby={titleId} className="border-t border-line py-6 first:border-t-0 first:pt-2">
      {temaTexto ? <p className="mb-2 text-footnote font-semibold text-[var(--accent)]">{temaTexto}</p> : null}
      {/* Marcas: fijada, oculta, reportes, resuelta y respuesta nueva */}
      {duda.fijada || duda.oculta || duda.reportesCount || duda.estado === 'resuelta' || nueva ? (
        <p className="mb-3 flex flex-wrap gap-2">
          {duda.fijada ? (
            <span className={MARCA}>
              <Pin className="h-3.5 w-3.5" aria-hidden="true" />
              {c.fijada}
            </span>
          ) : null}
          {duda.oculta ? (
            <span className={MARCA}>
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              {c.oculta}
            </span>
          ) : null}
          {duda.reportesCount ? (
            <span className={MARCA}>
              <Flag className="h-3.5 w-3.5" aria-hidden="true" />
              {c.reportes(duda.reportesCount)}
            </span>
          ) : null}
          {duda.estado === 'resuelta' ? (
            <span className={MARCA_ACENTO}>
              <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
              {c.resuelta}
            </span>
          ) : null}
          {nueva ? <span className={MARCA_ACENTO}>{c.respuestaNueva}</span> : null}
        </p>
      ) : null}

      {duda.retirada ? (
        <h5 id={titleId} className="text-lg font-medium italic text-ink-3">
          {c.retirada}
        </h5>
      ) : modo === 'editar' ? (
        <>
          <h5 id={titleId} className="sr-only">{duda.titulo}</h5>
          <DudaForm
            modo="editar"
            lang={lang}
            initial={{ titulo: duda.titulo, texto: duda.texto }}
            autoFocus
            onCancel={() => setModo(null)}
            onSubmit={async (valores) => {
              const ok = await onAccion('editar', valores);
              if (ok) setModo(null);
              return ok;
            }}
          />
        </>
      ) : (
        <>
          <h5 id={titleId} className="text-pretty text-lg font-semibold leading-snug text-ink">
            {duda.titulo}
          </h5>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-footnote text-ink-3">
            <span className="font-medium text-ink-2">{duda.mine ? c.tuDuda : duda.autorNombre}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={duda.createdAt}>{tiempoRelativo(duda.createdAt, lang)}</time>
          </p>
          <p className="mt-3 whitespace-pre-line text-pretty text-base leading-relaxed text-ink-2">{duda.texto}</p>
        </>
      )}

      {duda.estado === 'abierta' && !duda.retirada ? (
        <p className="mt-3 text-footnote text-ink-3">{c.pendiente(tiempoRelativo(duda.createdAt, lang))}</p>
      ) : null}

      {respuestas.length ? (
        <ul className="mt-5 space-y-5 sm:ml-6" aria-label={c.respuestas(respuestas.length)}>
          {respuestas.map((r) => (
            <DudaRespuesta
              key={r._id}
              respuesta={r}
              lang={lang}
              puedePublicar={puedePublicar}
              puedeModerar={duda.puedeModerar}
              onAccion={onAccion}
              confirmar={setConfirm}
            />
          ))}
        </ul>
      ) : null}

      {modo !== 'editar' ? (
        <DudaAcciones
          duda={duda}
          lang={lang}
          puedePublicar={puedePublicar}
          onAccion={onAccion}
          confirmar={setConfirm}
          onResponder={() => setModo('responder')}
          onEditar={() => setModo('editar')}
        />
      ) : null}

      {modo === 'responder' ? (
        <div className="mt-4 sm:ml-6">
          <DudaForm
            modo="respuesta"
            lang={lang}
            autoFocus
            onCancel={() => setModo(null)}
            onSubmit={async ({ texto }) => {
              const ok = await onAccion('responder', texto);
              if (ok) setModo(null);
              return ok;
            }}
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        confirmLabel={confirm?.label}
        cancelLabel={c.cancelar}
        destructive={confirm?.destructive}
        busy={busy}
        onConfirm={confirmar}
        onCancel={() => setConfirm(null)}
      />
    </li>
  );
}
