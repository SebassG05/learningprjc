/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useRef, useState } from 'react';
import { Reorder } from 'framer-motion';
import { useToast } from '../../../context/ToastContext';
import ConfirmDialog from '../ui/ConfirmDialog';
import NewTopicForm from './NewTopicForm';
import TopicItem from './TopicItem';
import useTopics from './useTopics';
import { topicLabel } from './topicForm';
import { COPY } from './gestionCopy';

/**
 * Temas de un curso: reordenación por arrastre (desde el asa) o con subir/bajar, edición,
 * materiales y alta. El nuevo orden se guarda al soltar y se anuncia a los lectores de pantalla.
 */
export default function TopicsEditor({ course, onCourseChange }) {
  const { showToast } = useToast();
  const t = useTopics(course, onCourseChange);
  const [announce, setAnnounce] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const latest = useRef(t.topics);
  latest.current = t.topics;
  const langs = t.course?.idiomasDisponibles?.length ? t.course.idiomasDisponibles : ['es'];

  const guard = (promise, ok) =>
    promise.then(
      () => {
        if (ok) showToast(ok, 'success');
        return true;
      },
      (err) => {
        showToast(err?.message && err.status < 500 ? err.message : COPY.topics.failed, 'error', 5000);
        return false;
      }
    );

  // Los toasts de cada operación van aquí; TopicItem solo llama a api.*
  const api = {
    busy: t.busy,
    update: (id, body) => guard(t.update(id, body), COPY.topics.topicSaved),
    upload: (id, fd) => guard(t.upload(id, fd), COPY.topics.uploaded),
    removeMaterial: (id, mid) => guard(t.removeMaterial(id, mid), COPY.topics.materialRemoved),
  };

  const commit = async (order, moved) => {
    const ok = await t.commitOrder(order);
    if (!ok) showToast(COPY.topics.reorderFailed, 'error', 5000);
    else if (moved) setAnnounce(COPY.topics.moved(topicLabel(moved), order.indexOf(moved) + 1));
  };

  const move = (index, delta) => {
    const order = [...latest.current];
    const [item] = order.splice(index, 1);
    order.splice(index + delta, 0, item);
    commit(order, item);
  };

  return (
    <div className="space-y-6">
      <header>
        <h3 className="font-sans text-base font-semibold text-ink">{COPY.topics.title}</h3>
        <p className="mt-1 text-footnote text-ink-3">{COPY.topics.hint}</p>
      </header>
      <p aria-live="polite" className="sr-only">{announce}</p>

      {t.topics.length ? (
        <Reorder.Group axis="y" values={t.topics} onReorder={t.preview} className="space-y-2">
          {t.topics.map((topic, i) => (
            <TopicItem
              key={topic._id}
              topic={topic}
              index={i}
              count={t.topics.length}
              langs={langs}
              api={api}
              onMove={move}
              onDragEnd={() => commit(latest.current, topic)}
              onRequestDelete={setToDelete}
            />
          ))}
        </Reorder.Group>
      ) : (
        <p className="rounded-2xl border border-dashed border-line-strong p-6 text-center text-callout text-ink-2">{COPY.topics.empty}</p>
      )}

      <NewTopicForm langs={langs} busy={t.busy === 'add'} onAdd={(body) => guard(t.add(body), COPY.topics.added)} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={toDelete ? COPY.topics.removeTitle(topicLabel(toDelete)) : ''}
        description={COPY.topics.removeBody}
        confirmLabel={COPY.topics.remove}
        destructive
        busy={Boolean(toDelete) && t.busy === `remove:${toDelete._id}`}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          await guard(t.remove(toDelete._id), COPY.topics.removed);
          setToDelete(null);
        }}
      />
    </div>
  );
}
