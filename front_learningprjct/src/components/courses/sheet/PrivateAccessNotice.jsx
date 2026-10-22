/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { forwardRef, useId, useState } from 'react';
import { CalendarClock, Lock } from 'lucide-react';
import Button from '../../ui/Button';
import { inputClass } from '../../ui/Field';
import { PRIVATE } from '../coursesCopy';
import { formatCohortDate } from './privateAccess';

// Bajo el botón de la portada en un curso privado: por qué no puede entrar (o cuándo podrá) y, si no
// tiene plaza, el formulario «Avísame de la próxima edición». El input es el destino del botón
// «Avísame» de la barra fija y del cierre cuando no hay sesión (ref).
const PrivateAccessNotice = forwardRef(function PrivateAccessNotice({ access, signedIn, interest, onLogin }, inputRef) {
  const { view } = access;
  if (view === 'open' || view === 'member' || view === 'checking') return null;

  const wantsEmail = (view === 'invite-only' || view === 'ended') && !signedIn && !interest.done;
  const lead =
    view === 'reserved'
      ? PRIVATE.lead.reserved(formatCohortDate(access.startsAt))
      : view === 'readonly'
        ? PRIVATE.lead.readonly(formatCohortDate(access.endsAt))
        : PRIVATE.lead[view];

  return (
    <div className="mt-6 max-w-xl rounded-2xl bg-surface-2/70 p-5 ring-1 ring-inset ring-line-strong">
      <p className="flex items-start gap-3 text-callout text-ink-2">
        {view === 'reserved' ? (
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
        ) : (
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-dawn" aria-hidden="true" />
        )}
        <span>{lead}</span>
      </p>

      {wantsEmail ? <InterestForm ref={inputRef} interest={interest} /> : null}

      {access.needsLogin ? (
        <p className="mt-4 text-footnote text-ink-3">
          <button type="button" onClick={onLogin} className="-my-2 py-2 font-semibold text-brand-300 underline-offset-4 hover:underline">
            {PRIVATE.login}
          </button>
          {' · '}
          {PRIVATE.loginHint}
        </p>
      ) : null}
    </div>
  );
});

const InterestForm = forwardRef(function InterestForm({ interest }, ref) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    // Comprobación básica para avisar sin ir al servidor; el backend valida de verdad
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    await interest.submit(value);
  };

  return (
    <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="sr-only">{PRIVATE.emailLabel}</label>
        <input
          ref={ref}
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={PRIVATE.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          className={inputClass}
        />
        {invalid ? (
          <p id={`${id}-error`} role="alert" className="mt-2 text-footnote text-danger">{PRIVATE.invalidEmail}</p>
        ) : null}
      </div>
      <Button type="submit" size="md" disabled={interest.sending} aria-busy={interest.sending || undefined} className="h-12 shrink-0">
        {interest.sending ? PRIVATE.sending : PRIVATE.submit}
      </Button>
    </form>
  );
});

export default PrivateAccessNotice;
