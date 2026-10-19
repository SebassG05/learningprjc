import { useCallback, useRef, useState } from 'react';
import { addTopic, deleteMaterial, deleteTopic, reorderTopics, updateTopic, uploadMaterial } from '../../../lib/adminApi';

/**
 * Temas de un curso en el editor. Cada operación devuelve el curso actualizado del backend y
 * se refleja aquí y en `onCourseChange` (lista de cursos). Reordenar es optimista: si falla,
 * vuelve el orden anterior.
 */
export default function useTopics(course, onCourseChange) {
  const [current, setCurrent] = useState(course);
  const [busy, setBusy] = useState(null); // clave de la operación en curso
  const lastSaved = useRef(course?.temas ?? []);

  const apply = useCallback(
    (c) => {
      setCurrent(c);
      lastSaved.current = c.temas ?? [];
      onCourseChange?.(c);
      return c;
    },
    [onCourseChange]
  );

  const run = useCallback(
    async (key, fn) => {
      setBusy(key);
      try {
        return apply(await fn());
      } finally {
        setBusy(null);
      }
    },
    [apply]
  );

  const id = current?._id;

  // Solo cambia el orden en pantalla (durante el arrastre)
  const preview = useCallback((temas) => setCurrent((c) => ({ ...c, temas })), []);

  const commitOrder = useCallback(
    async (temas) => {
      const before = lastSaved.current;
      if (temas.map((t) => t._id).join() === before.map((t) => t._id).join()) return true;
      setCurrent((c) => ({ ...c, temas }));
      try {
        apply(await reorderTopics(id, temas.map((t) => t._id)));
        return true;
      } catch {
        setCurrent((c) => ({ ...c, temas: before }));
        return false;
      }
    },
    [id, apply]
  );

  return {
    course: current,
    topics: current?.temas ?? [],
    busy,
    preview,
    commitOrder,
    add: (body) => run('add', () => addTopic(id, body)),
    update: (topicId, body) => run(`update:${topicId}`, () => updateTopic(id, topicId, body)),
    remove: (topicId) => run(`remove:${topicId}`, () => deleteTopic(id, topicId)),
    upload: (topicId, formData) => run(`upload:${topicId}`, () => uploadMaterial(id, topicId, formData)),
    removeMaterial: (topicId, materialId) => run(`material:${materialId}`, () => deleteMaterial(id, topicId, materialId)),
  };
}
