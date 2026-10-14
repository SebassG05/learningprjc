// Presenta la validación nativa (required, type="email") junto a cada campo. No añade reglas:
// el formulario lleva noValidate y aquí se pregunta al navegador con checkValidity(). Los textos
// propios se ponen con setCustomValidity solo sobre campos que el navegador ya considera inválidos,
// y se quitan antes de cada comprobación. Si todo es válido se llama al handler original tal cual.
import { useCallback, useState } from 'react';
import { customMessage, fieldMessage, firstInvalid } from './validation';

// Vuelve a la validez nativa del campo y, si falla, le pone el texto propio
function refresh(el) {
  if (!el.setCustomValidity) return;
  el.setCustomValidity('');
  const text = customMessage(el);
  if (text) el.setCustomValidity(text);
}

export default function useNativeValidation(onValidSubmit) {
  const [errors, setErrors] = useState({});

  const onSubmit = (e) => {
    const form = e.currentTarget;
    for (const el of form.elements) refresh(el);
    if (!form.checkValidity()) {
      e.preventDefault();
      const next = {};
      for (const el of form.elements) {
        if (el.name && el.validity?.valid === false) next[el.name] = fieldMessage(el);
      }
      setErrors(next);
      firstInvalid(form)?.focus();
      return undefined;
    }
    setErrors({});
    return onValidSubmit(e);
  };

  // Al corregir un campo con error, su mensaje se actualiza o desaparece
  const onInput = useCallback((e) => {
    const el = e.target;
    if (!el.name) return;
    refresh(el);
    setErrors((prev) => {
      if (!(el.name in prev)) return prev;
      const message = fieldMessage(el);
      if (message === prev[el.name]) return prev;
      const next = { ...prev };
      if (message) next[el.name] = message;
      else delete next[el.name];
      return next;
    });
  }, []);

  // Solo el estado visual: los valores de los campos no se tocan
  const reset = useCallback(() => setErrors({}), []);

  return { errors, onSubmit, onInput, reset };
}
