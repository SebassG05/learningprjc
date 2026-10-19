/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useRef, useState } from 'react';
import { FileText, ListOrdered, Loader } from 'lucide-react';
import Button from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';
import { createCourse, updateCourse } from '../../../lib/adminApi';
import Drawer from '../ui/Drawer';
import SegmentedControl from '../ui/SegmentedControl';
import { courseName } from '../shared/adminFormat';
import CourseForm from './CourseForm';
import TopicsEditor from './TopicsEditor';
import { appendCatalogFields, catalogFieldsError, catalogFormValues } from './courseCatalogForm';
import { courseFormData, emptyCourseForm, firstError, formFromCourse, isDirty, validateCourse } from './courseFormModel';
import { COPY } from './gestionCopy';

/**
 * Editor de un curso en el panel lateral: «Información» (formulario validado en línea) y
 * «Temas» (orden, textos y materiales). Un curso nuevo pasa a «Temas» al crearse.
 * Sigue montado mientras se cierra (animación de salida); el padre lo reinicia con `key`.
 * Con cambios sin guardar, el padre pide confirmación antes de cerrar (`onDirtyChange`).
 */
export default function CourseEditor({ open, course, onClose, onSaved, onDirtyChange }) {
  const { showToast } = useToast();
  const [saved, setSaved] = useState(course); // null = curso nuevo aún sin crear
  const [section, setSection] = useState('info');
  const [initial, setInitial] = useState(() => (course ? formFromCourse(course) : emptyCourseForm()));
  const [form, setForm] = useState(initial);
  const [catalogInitial, setCatalogInitial] = useState(() => catalogFormValues(course));
  const [catalog, setCatalog] = useState(catalogInitial);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const bodyRef = useRef(null);

  const dirty = isDirty(form, initial) || JSON.stringify(catalog) !== JSON.stringify(catalogInitial);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  // Tras el primer intento de envío, los errores se recalculan al escribir (y desaparecen al corregir)
  useEffect(() => {
    if (submitted) setErrors(validateCourse(form, catalogFieldsError(catalog)));
  }, [form, catalog, submitted]);

  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const submit = async () => {
    setSubmitted(true);
    const e = validateCourse(form, catalogFieldsError(catalog));
    setErrors(e);
    const first = firstError(e);
    if (first) {
      bodyRef.current?.querySelector(`[data-field="${first}"]`)?.focus();
      return;
    }
    setSaving(true);
    try {
      const fd = courseFormData(form, (d) => appendCatalogFields(d, catalog));
      const result = saved ? await updateCourse(saved._id, fd) : await createCourse(fd);
      const isNew = !saved;
      setSaved(result);
      const next = formFromCourse(result);
      setInitial(next);
      setForm(next);
      const nextCatalog = catalogFormValues(result);
      setCatalogInitial(nextCatalog);
      setCatalog(nextCatalog);
      setSubmitted(false);
      onSaved(result, isNew);
      showToast(isNew ? COPY.editor.created : COPY.editor.saved, 'success');
      if (isNew) setSection('topics');
    } catch (err) {
      showToast(err?.message || COPY.topics.failed, 'error', 5000);
    } finally {
      setSaving(false);
    }
  };

  const errorCount = Object.keys(errors).length;
  const sections = [
    { value: 'info', label: COPY.editor.sections.info, icon: FileText },
    { value: 'topics', label: COPY.editor.sections.topics, icon: ListOrdered },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="lg"
      bare
      closeLabel={COPY.editor.close}
      title={saved ? courseName(saved) : COPY.editor.newTitle}
      subtitle={saved ? `${saved.temas?.length ?? 0} temas · ${saved.isOpen ? COPY.open : COPY.closed}` : undefined}
    >
      <div className="shrink-0 border-b border-line px-5 py-3 md:px-6">
        {saved ? (
          <SegmentedControl options={sections} value={section} onChange={setSection} label="Secciones del editor" layoutId="editor-seccion" />
        ) : (
          <p className="text-footnote text-ink-3">{COPY.editor.topicsLocked}</p>
        )}
      </div>

      <div ref={bodyRef} data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 md:px-6">
        {section === 'info' || !saved ? (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="mx-auto max-w-3xl"
          >
            <CourseForm form={form} setForm={setForm} errors={errors} catalog={catalog} setCatalog={setCatalog} onCatalogError={(m) => showToast(m, 'error')} />
          </form>
        ) : (
          <div className="mx-auto max-w-3xl">
            <TopicsEditor
              course={saved}
              onCourseChange={(c) => {
                // La cabecera («N temas») y la lista de cursos reflejan cada cambio en los temas
                setSaved(c);
                onSaved(c, false);
              }}
            />
          </div>
        )}
      </div>

      {section === 'info' || !saved ? (
        <footer className="shrink-0 border-t border-line bg-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p aria-live="polite" className={`text-footnote sm:mr-auto ${errorCount ? 'text-danger' : 'text-ink-3'}`}>
              {errorCount ? COPY.editor.fixErrors(errorCount) : dirty ? COPY.editor.unsaved : ' '}
            </p>
            <Button onClick={submit} disabled={saving || (saved && !dirty)} aria-busy={saving || undefined}>
              {saving ? <Loader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
              {saving ? COPY.editor.saving : saved ? COPY.editor.save : COPY.editor.create}
            </Button>
          </div>
        </footer>
      ) : null}
    </Drawer>
  );
}
