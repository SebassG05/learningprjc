/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useId, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Field from '../ui/Field';
import TextAreaField from '../ui/TextAreaField';
import { dudasCopy } from './dudasCopy';

/**
 * Formulario para preguntar (`modo="duda"`), responder (`"respuesta"`) o editar (`"editar"`; con título
 * si `initial.titulo` existe, es decir, si se edita una duda). Valida lo mismo que el servidor y deja el
 * aviso de privacidad justo encima del botón de enviar. `onSubmit(valores)` resuelve con algo verdadero si
 * se guardó; si falla, el texto se conserva. `children` se pinta antes de los campos (p. ej. un selector).
 */
export default function DudaForm({ modo = 'duda', lang = 'es', initial = {}, onSubmit, onCancel, autoFocus = false, children }) {
  const c = dudasCopy(lang);
  const { limites } = c;
  const conTitulo = modo === 'duda' || (modo === 'editar' && initial.titulo !== undefined);
  const esRespuesta = modo === 'respuesta' || (modo === 'editar' && !conTitulo);
  const [titulo, setTitulo] = useState(initial.titulo ?? '');
  const [texto, setTexto] = useState(initial.texto ?? '');
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const firstRef = useRef(null);
  const id = useId();
  const tituloId = `${id}-titulo`;
  const textoId = `${id}-texto`;
  const avisoId = `${id}-aviso`;

  // Al abrirse desde «Preguntar una duda» o «Responder», el foco entra en el formulario
  useEffect(() => {
    if (autoFocus) firstRef.current?.focus();
  }, [autoFocus]);

  const validar = () => {
    const e = {};
    if (conTitulo) {
      if (!titulo.trim()) e.titulo = c.validacion.tituloVacio;
      else if (titulo.trim().length > limites.titulo) e.titulo = c.validacion.tituloLargo;
    }
    if (!texto.trim()) e.texto = esRespuesta ? c.validacion.respuestaVacia : c.validacion.textoVacio;
    else if (texto.trim().length > limites.texto) e.texto = c.validacion.textoLargo;
    return e;
  };

  const enviar = async (ev) => {
    ev.preventDefault();
    if (enviando) return;
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) {
      document.getElementById(e.titulo ? tituloId : textoId)?.focus();
      return;
    }
    setEnviando(true);
    const valores = conTitulo ? { titulo: titulo.trim(), texto: texto.trim() } : { texto: texto.trim() };
    const ok = await onSubmit(valores);
    setEnviando(false);
    if (ok && modo !== 'editar') {
      setTitulo('');
      setTexto('');
    }
  };

  const aviso = modo === 'duda' ? c.avisoDuda : modo === 'respuesta' ? c.avisoRespuesta : null;
  const largoTexto = texto.trim().length;

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-5" aria-busy={enviando || undefined}>
      {children}
      {conTitulo ? (
        <div className="flex flex-col gap-2">
          <Field
            ref={firstRef}
            id={tituloId}
            label={c.campos.titulo}
            value={titulo}
            onChange={(ev) => setTitulo(ev.target.value)}
            autoComplete="off"
            aria-invalid={errores.titulo ? true : undefined}
            aria-describedby={errores.titulo ? `${tituloId}-error` : undefined}
          />
          {errores.titulo ? (
            <p id={`${tituloId}-error`} className="flex items-start gap-1.5 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{errores.titulo}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <TextAreaField
          ref={conTitulo ? undefined : firstRef}
          id={textoId}
          label={esRespuesta ? c.campos.respuesta : c.campos.texto}
          value={texto}
          onChange={(ev) => setTexto(ev.target.value)}
          error={errores.texto}
          rows={4}
        />
        <p aria-hidden="true" className={`self-end text-footnote tabular-nums ${largoTexto > limites.texto ? 'text-danger' : 'text-ink-3'}`}>
          {c.contador(largoTexto, limites.texto)}
        </p>
      </div>

      {aviso ? (
        <p id={avisoId} className="max-w-2xl text-footnote leading-relaxed text-ink-3">
          {aviso}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={enviando} aria-describedby={aviso ? avisoId : undefined}>
          {enviando ? c.enviando : modo === 'editar' ? c.guardar : modo === 'respuesta' ? c.responder : c.publicar}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={enviando}>
            {c.cancelar}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
