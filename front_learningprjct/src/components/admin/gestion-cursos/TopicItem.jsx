/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { ArrowDown, ArrowUp, ChevronDown, FileText, GripVertical, Loader, Trash2, X } from 'lucide-react';
import Button from '../../ui/Button';
import Badge from '../ui/Badge';
import { focusRing } from '../ui/tones';
import MaterialUpload from './MaterialUpload';
import TopicFields from './TopicFields';
import { topicFormValues, topicHasTitle, topicLabel } from './topicForm';
import { COPY } from './gestionCopy';

const iconBtn = `flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-white/[0.08] hover:text-ink disabled:pointer-events-none disabled:opacity-30 ${focusRing}`;

/**
 * Un tema en el editor: asa para arrastrar, subir/bajar con botones (teclado) y, al desplegar,
 * edición de textos, materiales y borrado. El arrastre solo empieza desde el asa.
 */
export default function TopicItem({ topic, index, count, langs, api, onMove, onDragEnd, onRequestDelete }) {
  const drag = useDragControls();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(() => topicFormValues(topic));
  const [error, setError] = useState(null);
  const label = topicLabel(topic);
  const materials = topic.materiales ?? [];
  const panelId = `tema-${topic._id}`;
  const dirty = JSON.stringify(values) !== JSON.stringify(topicFormValues(topic));

  const save = async () => {
    if (!topicHasTitle(values)) {
      setError(COPY.topics.titleRequired);
      return;
    }
    setError(null);
    await api.update(topic._id, values);
  };

  return (
    <Reorder.Item
      value={topic}
      dragListener={false}
      dragControls={drag}
      onDragEnd={onDragEnd}
      className="relative rounded-2xl border border-line bg-surface"
      whileDrag={{ scale: 1.01, boxShadow: '0 12px 32px -12px rgb(0 0 0 / 0.6)' }}
    >
      <div className="flex items-center gap-1 p-2 pr-3">
        <button
          type="button"
          aria-label={COPY.topics.drag(label)}
          onPointerDown={(e) => drag.start(e)}
          className={`${iconBtn} cursor-grab touch-none active:cursor-grabbing`}
        >
          <GripVertical className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={COPY.topics.expand(label)}
          onClick={() => setOpen((o) => !o)}
          className={`flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 text-left ${focusRing}`}
        >
          <span className="w-8 shrink-0 text-footnote font-semibold tabular-nums text-ink-3">T{index + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-ink">{label}</span>
            <span className="block text-footnote text-ink-3">{materials.length ? `${materials.length} PDF` : COPY.topics.noMaterials}</span>
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={COPY.topics.moveUp(label)} className={iconBtn}>
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => onMove(index, 1)} disabled={index === count - 1} aria-label={COPY.topics.moveDown(label)} className={iconBtn}>
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {open ? (
        <div id={panelId} className="space-y-6 border-t border-line px-4 pb-4 pt-4">
          <TopicFields value={values} onChange={setValues} langs={langs} error={error} idPrefix={panelId} />
          <div className="flex justify-end">
            <Button size="sm" className="min-h-11" disabled={!dirty || api.busy === `update:${topic._id}`} onClick={save}>
              {api.busy === `update:${topic._id}` ? <Loader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
              {COPY.topics.saveTopic}
            </Button>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-ink">{COPY.topics.materials}</p>
            {materials.length ? (
              <ul className="space-y-2">
                {materials.map((m, i) => (
                  <li key={m._id} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 py-1 pl-3 pr-1">
                    <FileText className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{m.titulo || COPY.topics.material(i + 1)}</span>
                    <Badge label={COPY.topics.lang[m.idioma] ?? COPY.topics.lang.es} size="sm" />
                    <button
                      type="button"
                      onClick={() => api.removeMaterial(topic._id, m._id)}
                      disabled={api.busy === `material:${m._id}`}
                      aria-label={COPY.topics.removeMaterial(i + 1)}
                      className={`${iconBtn} hover:text-danger`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-footnote text-ink-3">{COPY.topics.noMaterials}</p>
            )}
            <MaterialUpload langs={langs} busy={api.busy === `upload:${topic._id}`} onUpload={(fd) => api.upload(topic._id, fd)} />
          </div>

          <div className="border-t border-line pt-4">
            <button
              type="button"
              onClick={() => onRequestDelete(topic)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-danger hover:bg-danger/10 ${focusRing}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {COPY.topics.remove}
            </button>
          </div>
        </div>
      ) : null}
    </Reorder.Item>
  );
}
