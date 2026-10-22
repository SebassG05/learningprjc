/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useId, useMemo, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import Button from '../../ui/Button';
import { inputClass } from '../../ui/Field';
import { useToast } from '../../../context/ToastContext';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';
import RelativeTime from '../ui/RelativeTime';
import SearchInput from '../ui/SearchInput';
import SelectField from '../ui/SelectField';
import { focusRing } from '../ui/tones';
import { COPY } from './accesosCopy';
import { sortMembers, summaryText } from './accesosQuery';

// Miembros de una cohorte: alta masiva pegando emails (con resumen) y lista con estado y «Quitar»
export default function MembersPanel({ cohort, onAdd, onRemove }) {
  const { showToast } = useToast();
  const pasteId = useId();
  const hintId = useId();
  const [emails, setEmails] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [adding, setAdding] = useState(false);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState({ status: '', q: '' });
  const [toRemove, setToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  const members = useMemo(() => sortMembers(cohort.members, filter), [cohort.members, filter]);

  const add = async (e) => {
    e.preventDefault();
    if (!emails.trim()) return;
    setAdding(true);
    try {
      const result = await onAdd(emails, sendEmail);
      setSummary(result);
      // Se deja en el cuadro solo lo que no se pudo añadir, para corregirlo
      setEmails(result.invalid.join('\n'));
    } catch (err) {
      if (err.body?.summary) {
        setSummary(err.body.summary);
      } else {
        showToast(err.message || COPY.errors.generic, 'error');
      }
    } finally {
      setAdding(false);
    }
  };

  const confirmRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(toRemove._id);
      showToast(COPY.members.removed, 'success');
      setToRemove(null);
    } catch (err) {
      showToast(err.message || COPY.errors.generic, 'error');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="space-y-3">
        <label htmlFor={pasteId} className="text-sm font-medium text-ink-2">{COPY.members.pasteLabel}</label>
        <textarea
          id={pasteId}
          rows={4}
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder={COPY.members.pastePlaceholder}
          aria-describedby={hintId}
          spellCheck={false}
          className={`${inputClass} h-auto min-h-28 resize-y py-3 font-mono text-sm`}
        />
        <p id={hintId} className="text-footnote text-ink-3">{COPY.members.pasteHint}</p>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-brand-400" />
          <span className="text-callout text-ink">
            {COPY.members.sendEmail}
            <span className="mt-1 block text-footnote text-ink-3">{COPY.members.sendEmailHint}</span>
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={adding || !emails.trim()} aria-busy={adding || undefined}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {adding ? COPY.members.adding : COPY.members.add}
          </Button>
          {summary ? (
            <p role="status" className="text-callout text-ink-2">
              {summaryText(summary)}
              {summary.invalid.length ? <span className="block text-footnote text-danger">{`${COPY.members.invalidList} ${summary.invalid.join(', ')}`}</span> : null}
            </p>
          ) : null}
        </div>
      </form>

      {cohort.members.length === 0 ? (
        <p className="text-callout text-ink-3">{COPY.members.empty}</p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput value={filter.q} onChange={(q) => setFilter((f) => ({ ...f, q }))} label={COPY.members.searchLabel} placeholder={COPY.members.searchPlaceholder} className="sm:flex-1" />
            <SelectField label={COPY.members.filterLabel} value={filter.status} onChange={(status) => setFilter((f) => ({ ...f, status }))} options={COPY.members.filter} className="sm:w-auto" />
          </div>
          {members.length === 0 ? (
            <p className="text-callout text-ink-3">{COPY.members.noMatches}</p>
          ) : (
            <ul className="divide-y divide-line rounded-2xl border border-line">
              {members.map((m) => (
                <li key={m._id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{m.user?.name ?? m.email}</p>
                    <p className="truncate text-footnote text-ink-3">
                      {m.user?.name ? `${m.email} · ` : ''}
                      {COPY.members.source[m.source]} · <RelativeTime date={m.addedAt} />
                    </p>
                  </div>
                  <Badge label={COPY.members.status[m.status]} toneName={m.status === 'active' ? 'brand' : 'dawn'} size="sm" />
                  <button
                    type="button"
                    onClick={() => setToRemove(m)}
                    aria-label={COPY.members.removeLabel(m.email)}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-white/[0.06] hover:text-danger ${focusRing}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toRemove)}
        title={toRemove ? COPY.members.removeConfirm.title(toRemove.email) : ''}
        description={COPY.members.removeConfirm.body}
        confirmLabel={COPY.members.removeConfirm.confirm}
        destructive
        busy={removing}
        onCancel={() => setToRemove(null)}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
