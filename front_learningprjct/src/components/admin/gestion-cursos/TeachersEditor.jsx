/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useCallback, useEffect, useId, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Send, Trash2, UserPlus } from 'lucide-react';
import Button from '../../ui/Button';
import { inputClass } from '../../ui/Field';
import { useToast } from '../../../context/ToastContext';
import { addTeacher, fetchTeachers, removeTeacher, resendTeacher } from '../../../lib/adminApi';
import { tiempoRelativo } from '../../dudas/dudasFormat';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import { focusRing } from '../ui/tones';
import { COPY } from './gestionCopy';

const T = COPY.teachers;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const same = (a, b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();

// Mensaje de error de una alta, un reenvío o una baja según el código del servidor
const errorMessage = (err) => {
  switch (err?.body?.code) {
    case 'bad-email': return T.errors.badEmail;
    case 'duplicate': return T.errors.duplicate;
    case 'limit': return T.errors.limit;
    case 'mail-failed': return T.errors.mailFailed;
    case 'already-linked': return T.errors.alreadyLinked;
    default: return T.errors.generic;
  }
};

/**
 * Profesores de un curso (solo al editar uno existente): se invitan por correo y se vinculan a su
 * cuenta al aceptar. Cada cambio se guarda al momento por su propio endpoint, no por el formulario.
 */
export default function TeachersEditor({ courseId }) {
  const { showToast } = useToast();
  const inputId = useId();
  const errorId = useId();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [attempt, setAttempt] = useState(0);
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [toRemove, setToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setStatus('loading');
    fetchTeachers(courseId, ctrl.signal)
      .then((list) => {
        setRows(Array.isArray(list) ? list : []);
        setStatus('ready');
      })
      .catch((err) => err.name !== 'AbortError' && setStatus('error'));
    return () => ctrl.abort();
  }, [courseId, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const full = rows.length >= T.max;

  const add = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setFieldError(T.errors.badEmail);
      return;
    }
    setFieldError('');
    setAdding(true);
    try {
      const row = await addTeacher(courseId, value);
      setRows((list) => [...list, row]);
      setEmail('');
      showToast(T.added, 'success');
    } catch (err) {
      showToast(errorMessage(err), 'error', 5000);
      // Con «mail-failed» el profesor sí quedó guardado: se vuelve a leer la lista para verlo
      if (err?.body?.code === 'mail-failed') {
        setEmail('');
        reload();
      }
    } finally {
      setAdding(false);
    }
  };

  const resend = async (row) => {
    setBusyId(row._id);
    try {
      const res = await resendTeacher(courseId, row._id);
      setRows((list) => list.map((r) => (r._id === row._id ? { ...r, ...(res?._id ? res : { lastSentAt: new Date().toISOString() }) } : r)));
      showToast(T.resent, 'success');
    } catch (err) {
      showToast(errorMessage(err), 'error', 5000);
      if (err?.body?.code === 'already-linked') reload();
    } finally {
      setBusyId(null);
    }
  };

  const confirmRemove = async () => {
    setRemoving(true);
    try {
      await removeTeacher(courseId, toRemove._id);
      setRows((list) => list.filter((r) => r._id !== toRemove._id));
      showToast(T.removed, 'success');
      setToRemove(null);
    } catch (err) {
      showToast(errorMessage(err), 'error', 5000);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <section aria-labelledby="profesores-titulo" className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 id="profesores-titulo" className="text-title-3 font-semibold text-ink">{T.title}</h2>
          {status === 'ready' ? <p className="text-footnote text-ink-3 tabular-nums">{T.count(rows.length, T.max)}</p> : null}
        </div>
        <p className="mt-1 text-callout text-ink-2">{T.hint}</p>
      </div>

      <form onSubmit={add} noValidate className="space-y-2">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-2">{T.emailLabel}</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={inputId}
            type="email"
            inputMode="email"
            autoComplete="off"
            spellCheck={false}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldError) setFieldError('');
            }}
            placeholder={T.emailPlaceholder}
            disabled={adding}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? errorId : undefined}
            className={`${inputClass} sm:flex-1`}
          />
          <Button type="submit" disabled={adding || full || !email.trim()} aria-busy={adding || undefined}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {adding ? T.adding : T.add}
          </Button>
        </div>
        {fieldError ? <p id={errorId} role="alert" className="text-footnote text-danger">{fieldError}</p> : null}
        {full ? <p className="text-footnote text-ink-3">{T.errors.limit}</p> : null}
      </form>

      {status === 'loading' ? (
        <div aria-busy="true" className="space-y-2">
          {[0, 1].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      ) : status === 'error' ? (
        <EmptyState tone="error" icon={AlertCircle} title={T.loadError} action={{ label: T.retry, onClick: reload }} className="py-10" />
      ) : rows.length === 0 ? (
        <p className="text-callout text-ink-3">{T.empty}</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line">
          {rows.map((r) => {
            const linked = r.status === 'active' || Boolean(r.linkedAt);
            const otra = linked && r.cuenta?.email && !same(r.cuenta.email, r.email);
            return (
              <li key={r._id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate font-medium text-ink">{r.email}</p>
                  {otra ? <p className="truncate text-footnote text-dawn">{T.linkedOther(r.cuenta.email)}</p> : null}
                </div>
                {linked ? (
                  <Badge
                    icon={CheckCircle2}
                    toneName="brand"
                    size="sm"
                    className="max-w-full !whitespace-normal"
                    label={T.linked(r.cuenta?.name || r.cuenta?.email || r.email, r.cuenta?.email || r.email)}
                  />
                ) : (
                  <Badge
                    icon={Clock}
                    toneName="dawn"
                    size="sm"
                    label={r.lastSentAt ? T.pending(tiempoRelativo(r.lastSentAt, 'es')) : T.pendingNoDate}
                  />
                )}
                {!linked ? (
                  <Button variant="secondary" size="sm" onClick={() => resend(r)} disabled={busyId === r._id} aria-label={T.resendLabel(r.email)}>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {T.resend}
                  </Button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setToRemove(r)}
                  aria-label={T.removeLabel(r.email)}
                  title={T.remove}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-white/[0.06] hover:text-danger ${focusRing}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toRemove)}
        title={toRemove ? T.removeConfirm.title(toRemove.email) : ''}
        description={T.removeConfirm.body}
        confirmLabel={T.removeConfirm.confirm}
        destructive
        busy={removing}
        onCancel={() => setToRemove(null)}
        onConfirm={confirmRemove}
      />
    </section>
  );
}
