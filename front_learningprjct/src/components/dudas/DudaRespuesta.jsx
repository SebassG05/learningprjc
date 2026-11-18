/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useState } from 'react';
import { EyeOff } from 'lucide-react';
import DudaForm from './DudaForm';
import { dudasCopy } from './dudasCopy';
import { tiempoRelativo } from './dudasFormat';
import { ACCION, MARCA } from './dudasUi';

/**
 * Una respuesta. La del profesorado lleva un filete con el color del tema y su etiqueta; la de un alumno va
 * sin adornos. Acciones: editar y borrar la propia, ocultar o mostrar si se puede moderar.
 * `onAccion(nombre, ...args)` llama a la acción del hook sobre esta duda; `confirmar` abre el diálogo.
 */
export default function DudaRespuesta({ respuesta: r, lang, puedePublicar, puedeModerar, onAccion, confirmar }) {
  const c = dudasCopy(lang);
  const [editando, setEditando] = useState(false);
  const staff = r.rol === 'profesor' || r.rol === 'equipo';

  return (
    <li className={staff ? 'border-l-2 border-[var(--accent)] pl-4' : ''}>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-footnote text-ink-3">
        <span className="font-semibold text-ink">{r.autorNombre}</span>
        {staff ? (
          <span className="font-semibold uppercase tracking-[0.1em] text-[var(--accent)]">{c.etiqueta[r.rol]}</span>
        ) : null}
        <span aria-hidden="true">·</span>
        <time dateTime={r.createdAt}>{tiempoRelativo(r.createdAt, lang)}</time>
        {r.editadaAt ? <span>· {c.editada}</span> : null}
        {r.oculta ? (
          <span className={MARCA}>
            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
            {c.oculta}
          </span>
        ) : null}
      </p>

      {editando ? (
        <div className="mt-3">
          <DudaForm
            modo="editar"
            lang={lang}
            initial={{ texto: r.texto }}
            autoFocus
            onCancel={() => setEditando(false)}
            onSubmit={async ({ texto }) => {
              const ok = await onAccion('editarRespuesta', r._id, texto);
              if (ok) setEditando(false);
              return ok;
            }}
          />
        </div>
      ) : (
        <p className="mt-1.5 whitespace-pre-line text-pretty text-base leading-relaxed text-ink-2">{r.texto}</p>
      )}

      {!editando && (r.mine || puedeModerar) ? (
        <div className="-ml-3 mt-1 flex flex-wrap">
          {r.mine && puedePublicar ? (
            <button type="button" className={ACCION} aria-label={c.accionRespuesta.editar} onClick={() => setEditando(true)}>
              {c.editar}
            </button>
          ) : null}
          {r.mine ? (
            <button
              type="button"
              className={ACCION}
              aria-label={c.accionRespuesta.borrar}
              onClick={() => confirmar({ title: c.confirmar.borrarRespuesta, label: c.borrar, destructive: true, run: () => onAccion('borrarRespuesta', r._id) })}
            >
              {c.borrar}
            </button>
          ) : null}
          {puedeModerar && !r.oculta ? (
            <button
              type="button"
              className={ACCION}
              aria-label={c.accionRespuesta.ocultar}
              onClick={() => confirmar({ title: c.confirmar.ocultarRespuesta, label: c.ocultar, run: () => onAccion('estado', 'ocultar', r._id) })}
            >
              {c.ocultar}
            </button>
          ) : null}
          {puedeModerar && r.oculta ? (
            <button type="button" className={ACCION} aria-label={c.accionRespuesta.mostrar} onClick={() => onAccion('estado', 'mostrar', r._id)}>
              {c.mostrar}
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
