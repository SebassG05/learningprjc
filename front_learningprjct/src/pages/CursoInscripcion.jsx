// Ficha pública de un curso, por escenas: portada → qué aprenderás → temario → ficha técnica → cierre.
// Sin sesión se puede ver entera; «Inscribirme» pide acceso y continúa al entrar.
// Las piezas viven en components/courses/sheet y los textos en components/courses/coursesCopy.js.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AuthModal from '../components/auth/LazyAuthModal';
import CourseHero from '../components/courses/sheet/CourseHero';
import CourseOutcomes from '../components/courses/sheet/CourseOutcomes';
import CourseVideo from '../components/courses/sheet/CourseVideo';
import useCourseVideo from '../components/courses/sheet/useCourseVideo';
import CourseSyllabus from '../components/courses/sheet/CourseSyllabus';
import CourseFacts from '../components/courses/sheet/CourseFacts';
import CourseClosing from '../components/courses/sheet/CourseClosing';
import CourseJsonLd from '../components/courses/sheet/CourseJsonLd';
import StickyEnrollBar from '../components/courses/sheet/StickyEnrollBar';
import TermsDialog from '../components/courses/sheet/TermsDialog';
import PrivateAccessNotice from '../components/courses/sheet/PrivateAccessNotice';
import { accessView } from '../components/courses/sheet/privateAccess';
import { SheetMessage, SheetSkeleton } from '../components/courses/sheet/SheetStates';
import useCourseSheet from '../components/courses/sheet/useCourseSheet';
import useEnrollAction from '../components/courses/sheet/useEnrollAction';
import { PRIVATE, PROVISIONAL } from '../components/courses/coursesCopy';
import {
  areaLabel,
  courseLanguages,
  courseMeta,
  courseObjectives,
  courseSummary,
  courseText,
  isBilingual,
  savedLanguage,
  saveLanguage,
} from '../components/courses/courseFormat';
import { useUser } from '../context/UserContext';
import usePageMeta from '../hooks/usePageMeta';
import { fetchTerms } from '../lib/coursesApi';

// Idioma inicial: el elegido antes (lang_<id>), el de su inscripción o el primero disponible
function initialLanguage(course, enrollment) {
  const available = courseLanguages(course);
  const bilingual = isBilingual(course);
  const valid = (l) => (l === 'es' || l === 'en') && (bilingual || available.length === 0 || available.includes(l));
  return [savedLanguage(course._id), enrollment?.preferredLanguage, available[0]].find(valid) ?? 'es';
}

export default function CursoInscripcion() {
  const { id } = useParams();
  const { user } = useUser();
  const userId = user?._id ?? user?.id ?? user?.email ?? null;
  const { status, course, catalog, enrollment, retry, markEnrolled } = useCourseSheet(id, userId);

  // El idioma lo elige el alumno en la portada; null = aún no lo ha tocado (se deduce)
  const [chosenLang, setChosenLang] = useState(null);
  const lang = course ? chosenLang ?? initialLanguage(course, enrollment.data) : 'es';
  const changeLang = (l) => {
    setChosenLang(l);
    saveLanguage(id, l);
  };

  const { title, description } = course ? courseText(course, lang) : { title: '', description: '' };
  usePageMeta(
    title ? `${title} · ${PROVISIONAL.pageTitle}` : PROVISIONAL.pageTitle,
    description ? courseSummary(description, 160) : PROVISIONAL.pageDescription
  );

  // El vídeo se pide ya, con el token, en paralelo a la inscripción: el backend decide preview o completo
  const video = useCourseVideo(id, userId, Boolean(enrollment.data?.enrolled));

  // Curso privado: lo que el backend dice de esta sesión (invitación, plaza reservada, solo lectura…)
  const access = useMemo(() => accessView(course), [course]);
  const emailRef = useRef(null);
  // «Avísame» sin sesión desde la barra fija o el cierre: lleva al campo de email de la portada
  const askEmail = useCallback(() => {
    emailRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    emailRef.current?.focus({ preventScroll: true });
  }, []);
  const [loginForAccess, setLoginForAccess] = useState(false);

  const enroll = useEnrollAction({ course, user, enrollment, language: lang, markEnrolled, access, onAskEmail: askEmail });
  // Mientras no se sabe si ya está inscrito, el botón no promete una acción equivocada
  const checking = Boolean(user) && enrollment.status === 'loading';
  const cta = { state: enroll.state, sending: enroll.sending || checking, onClick: enroll.act };

  // Con sesión y sin inscribir, las condiciones se piden en un momento libre: el diálogo abre ya con el texto
  const wantsTerms = Boolean(user) && enrollment.status === 'ready' && !enrollment.data?.enrolled;
  useEffect(() => {
    if (!wantsTerms) return undefined;
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const handle = idle(() => fetchTerms().catch(() => {}));
    return () => cancel(handle);
  }, [wantsTerms]);

  const heroCta = useRef(null);
  const closingCta = useRef(null);
  const watch = useMemo(() => [heroCta, closingCta], [status]); // eslint-disable-line react-hooks/exhaustive-deps -- se re-observa al pintar la ficha
  const objectives = useMemo(() => (course ? courseObjectives(course, lang) : null), [course, lang]);

  if (status === 'loading') return <SheetSkeleton />;
  if (status !== 'ready' || !course) return <SheetMessage kind={status} onRetry={retry} />;

  const enrolled = Boolean(enrollment.data?.enrolled);

  return (
    <div className="relative">
      <CourseJsonLd course={course} title={title} description={description} />
      <CourseHero
        course={course}
        title={title}
        description={description}
        lang={lang}
        onLang={changeLang}
        bilingual={isBilingual(course)}
        areaName={areaLabel(catalog, course.area)}
        cta={cta}
        ctaRef={heroCta}
        notice={
          <PrivateAccessNotice
            ref={emailRef}
            access={access}
            signedIn={Boolean(user)}
            interest={enroll.interest}
            onLogin={() => setLoginForAccess(true)}
          />
        }
      />
      <CourseVideo state={video} courseId={id} title={title} cta={cta} />
      <CourseOutcomes description={description} objectives={objectives} lang={lang} />
      <CourseSyllabus course={course} lang={lang} enrolled={enrolled} />
      <CourseFacts course={course} />
      <CourseClosing ref={closingCta} cta={cta} comingSoon={!course.isOpen} lead={PRIVATE.closingLead[access.view]} />

      <StickyEnrollBar watch={watch} meta={courseMeta(course)} cta={cta} />
      <AuthModal
        open={enroll.login.open || loginForAccess}
        onClose={() => {
          enroll.login.close();
          setLoginForAccess(false);
        }}
        redirectTo={null}
      />
      <TermsDialog
        key={enroll.terms.key}
        open={enroll.terms.open}
        mode={course.isOpen ? 'enroll' : 'reserve'}
        courseTitle={title}
        language={isBilingual(course) ? lang : null}
        sending={enroll.sending}
        onConfirm={enroll.terms.confirm}
        onClose={enroll.terms.close}
      />
    </div>
  );
}
