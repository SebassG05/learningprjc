/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useState } from 'react';
import Button from '../../ui/Button';
import { inputClass } from '../../ui/Field';
import FormField from '../ui/FormField';
import { COPY } from './accesosCopy';
import { fromLocalInput, toLocalInput } from './accesosQuery';

const initial = (cohort) => ({
  name: cohort?.name ?? '',
  startsAt: toLocalInput(cohort?.startsAt),
  endsAt: toLocalInput(cohort?.endsAt),
  afterEnd: cohort?.afterEnd ?? 'readonly',
});

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = COPY.form.errors.name;
  const start = fromLocalInput(form.startsAt);
  const end = fromLocalInput(form.endsAt);
  if (!start || !end) errors.dates = COPY.form.errors.dates;
  else if (new Date(end) <= new Date(start)) errors.dates = COPY.form.errors.order;
  return errors;
}

// Crear o editar una cohorte: nombre, ventana de fechas y qué pasa al terminar
export default function CohortForm({ cohort, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => initial(cohort));
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const set = (changes) => setForm((f) => ({ ...f, ...changes }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      e.currentTarget.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setSending(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        startsAt: fromLocalInput(form.startsAt),
        endsAt: fromLocalInput(form.endsAt),
        afterEnd: form.afterEnd,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl border border-line-strong bg-surface p-5 md:p-6">
      <FormField label={COPY.form.name} name="name" error={errors.name} required>
        {(props) => (
          <input {...props} type="text" maxLength={120} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder={COPY.form.namePlaceholder} className={inputClass} />
        )}
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label={COPY.form.startsAt} name="startsAt" error={errors.dates} hint={COPY.form.datesHint} required>
          {(props) => <input {...props} type="datetime-local" value={form.startsAt} onChange={(e) => set({ startsAt: e.target.value })} className={inputClass} />}
        </FormField>
        <FormField label={COPY.form.endsAt} name="endsAt" required>
          {(props) => (
            <input {...props} type="datetime-local" min={form.startsAt || undefined} value={form.endsAt} onChange={(e) => set({ endsAt: e.target.value })} aria-invalid={errors.dates ? true : undefined} className={inputClass} />
          )}
        </FormField>
      </div>
      <FormField label={COPY.form.afterEnd} name="afterEnd">
        {(props) => (
          <select {...props} value={form.afterEnd} onChange={(e) => set({ afterEnd: e.target.value })} className={inputClass}>
            {COPY.form.afterEndOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
      </FormField>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={sending}>{COPY.form.cancel}</Button>
        <Button type="submit" disabled={sending} aria-busy={sending || undefined}>{cohort ? COPY.form.save : COPY.form.create}</Button>
      </div>
    </form>
  );
}
