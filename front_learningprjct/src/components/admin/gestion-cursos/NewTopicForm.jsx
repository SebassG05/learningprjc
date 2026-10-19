/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useState } from 'react';
import { Loader, Plus } from 'lucide-react';
import Button from '../../ui/Button';
import TopicFields from './TopicFields';
import { topicFormValues, topicHasTitle } from './topicForm';
import { COPY } from './gestionCopy';

// Alta de un tema al final del curso (el backend le da el siguiente número libre)
export default function NewTopicForm({ langs, busy, onAdd }) {
  const [values, setValues] = useState(topicFormValues());
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!topicHasTitle(values)) {
      setError(COPY.topics.titleRequired);
      document.querySelector('[data-field^="nuevo-tema-titulo"]')?.focus();
      return;
    }
    setError(null);
    if (await onAdd(values)) setValues(topicFormValues());
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-dashed border-line-strong p-4">
      <p className="text-sm font-semibold text-ink">{COPY.topics.newTopic}</p>
      <TopicFields value={values} onChange={setValues} langs={langs} error={error} idPrefix="nuevo-tema" />
      <Button type="submit" size="sm" className="min-h-11" disabled={busy} aria-busy={busy || undefined}>
        {busy ? <Loader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
        {COPY.topics.add}
      </Button>
    </form>
  );
}
