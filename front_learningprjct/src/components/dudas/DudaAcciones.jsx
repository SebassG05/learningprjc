/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useId, useRef, useState } from 'react';
import Button from '../ui/Button';
import TextAreaField from '../ui/TextAreaField';
import { dudasCopy } from './dudasCopy';
import { ACCION } from './dudasUi';

/**
 * Acciones de una duda. Solo ofrece lo que el servidor permitiría (él lo vuelve a comprobar):
 * responder y editar con `puedePublicar`; retirar o borrar la propia siempre; resolver el autor o el
 * profesorado; reabrir el profesorado o el autor que puede publicar; fijar y ocultar el profesorado;
 * reportar cualquiera que no sea el autor (con un motivo opcional).
 */
export default function DudaAcciones({ duda, lang, puedePublicar, onAccion, confirmar, onResponder, onEditar }) {
  const c = dudasCopy(lang);
  const [reportando, setReportando] = useState(false);
  const { mine, puedeModerar, retirada, estado } = duda;
  const conRespuestas = (duda.respuestas ?? []).length > 0;

  const puedeResolver = estado !== 'resuelta' && (mine || puedeModerar);
  const puedeReabrir = estado === 'resuelta' && (puedeModerar || (mine && puedePublicar));

  return (
    <div className="mt-3">
      <div className="-ml-3 flex flex-wrap">
        {puedePublicar ? (
          <button type="button" className={ACCION} onClick={onResponder}>
            {c.responder}
          </button>
        ) : null}
        {mine && puedePublicar && !retirada ? (
          <button type="button" className={ACCION} onClick={onEditar}>
            {c.editar}
          </button>
        ) : null}
        {mine && !retirada ? (
          <button
            type="button"
            className={ACCION}
            onClick={() =>
              confirmar(
                conRespuestas
                  ? { title: c.confirmar.retirarDuda, label: c.retirar, destructive: true, run: () => onAccion('borrar') }
                  : { title: c.confirmar.borrarDuda, label: c.borrar, destructive: true, run: () => onAccion('borrar') },
              )
            }
          >
            {conRespuestas ? c.retirar : c.borrar}
          </button>
        ) : null}
        {puedeResolver ? (
          <button type="button" className={ACCION} onClick={() => onAccion('estado', 'resolver')}>
            {c.resolver}
          </button>
        ) : null}
        {puedeReabrir ? (
          <button type="button" className={ACCION} onClick={() => onAccion('estado', 'reabrir')}>
            {c.reabrir}
          </button>
        ) : null}
        {puedeModerar ? (
          <button type="button" className={ACCION} aria-pressed={Boolean(duda.fijada)} onClick={() => onAccion('estado', duda.fijada ? 'desfijar' : 'fijar')}>
            {duda.fijada ? c.desfijar : c.fijar}
          </button>
        ) : null}
        {puedeModerar && !duda.oculta ? (
          <button
            type="button"
            className={ACCION}
            onClick={() => confirmar({ title: c.confirmar.ocultarDuda, label: c.ocultar, run: () => onAccion('estado', 'ocultar') })}
          >
            {c.ocultar}
          </button>
        ) : null}
        {puedeModerar && duda.oculta ? (
          <button type="button" className={ACCION} onClick={() => onAccion('estado', 'mostrar')}>
            {c.mostrar}
          </button>
        ) : null}
        {!mine && !reportando ? (
          <button type="button" className={`${ACCION} text-ink-3`} onClick={() => setReportando(true)}>
            {c.reportar}
          </button>
        ) : null}
      </div>

      {reportando ? (
        <ReporteForm
          lang={lang}
          onCancel={() => setReportando(false)}
          onSubmit={async (motivo) => {
            const ok = await onAccion('reportar', motivo);
            if (ok) setReportando(false);
          }}
        />
      ) : null}
    </div>
  );
}

// Motivo opcional (≤300) para el reporte, en línea bajo las acciones
function ReporteForm({ lang, onSubmit, onCancel }) {
  const c = dudasCopy(lang);
  const id = useId();
  const ref = useRef(null);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const enviar = async (ev) => {
    ev.preventDefault();
    if (enviando) return;
    if (motivo.trim().length > c.limites.motivo) {
      setError(c.validacion.motivoLargo);
      ref.current?.focus();
      return;
    }
    setError('');
    setEnviando(true);
    await onSubmit(motivo.trim());
    setEnviando(false);
  };

  return (
    <form onSubmit={enviar} noValidate className="mt-3 flex max-w-2xl flex-col gap-3" aria-busy={enviando || undefined}>
      <TextAreaField
        ref={ref}
        id={`${id}-motivo`}
        label={c.campos.motivoOpcional}
        value={motivo}
        onChange={(ev) => setMotivo(ev.target.value)}
        error={error || undefined}
        rows={2}
        className="min-h-24!"
      />
      <p aria-hidden="true" className={`-mt-1 self-end text-footnote tabular-nums ${motivo.trim().length > c.limites.motivo ? 'text-danger' : 'text-ink-3'}`}>
        {c.contador(motivo.trim().length, c.limites.motivo)}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="sm" variant="secondary" disabled={enviando}>
          {enviando ? c.enviando : c.reportar}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={enviando}>
          {c.cancelar}
        </Button>
      </div>
    </form>
  );
}
