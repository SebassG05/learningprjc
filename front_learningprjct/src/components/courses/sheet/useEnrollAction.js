import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollInCourse, invalidateTerms, readToken, registerInterest } from '../../../lib/coursesApi';
import { useToast } from '../../../context/ToastContext';
import { ENROLL, PRIVATE } from '../coursesCopy';
import { saveLanguage } from '../courseFormat';
import { ctaState, INERT_CTA } from './privateAccess';

/**
 * Lo que hace el botón principal de la ficha según el alumno y el curso:
 *   enroll / reserve  → sin sesión pide acceso (y sigue al entrar); con sesión, abre los términos
 *                       y se inscribe al confirmarlos (el backend rechaza sin aceptación válida)
 *   enrolled          → lleva al aula
 *   reserved          → curso aún cerrado y plaza ya reservada: no hace nada
 * Cursos privados (access = accessView(course)):
 *   interest          → «Avísame de la próxima edición»: con sesión se apunta; sin ella, onAskEmail()
 *   cohort-reserved / closed / interested / checking → estados, no acciones
 * El idioma elegido en la ficha viaja en la inscripción (antes no se enviaba y todos quedaban en español).
 */
export default function useEnrollAction({ course, user, enrollment, language, markEnrolled, access = { view: 'open' }, onAskEmail }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [sending, setSending] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  // Cambia cuando el servidor anuncia otra versión: el diálogo se vuelve a montar con el texto nuevo
  const [termsKey, setTermsKey] = useState(0);

  const id = course?._id;
  const open = Boolean(course?.isOpen);
  const enrolled = Boolean(enrollment.data?.enrolled);
  const baseState = enrolled ? (open ? 'enrolled' : 'reserved') : open ? 'enroll' : 'reserve';
  const [interest, setInterest] = useState({ done: false, sending: false });
  const state = ctaState(access, baseState, { interested: interest.done });

  const sendInterest = useCallback(async (email) => {
    setInterest((i) => ({ ...i, sending: true }));
    try {
      await registerInterest(id, email);
      setInterest({ done: true, sending: false });
      showToast(PRIVATE.done, 'success');
      return true;
    } catch (err) {
      setInterest({ done: false, sending: false });
      const message = err.status === 400 ? PRIVATE.invalidEmail : err.status === 429 && err.message ? err.message : PRIVATE.error;
      showToast(message, 'error');
      return false;
    }
  }, [id, showToast]);

  const submit = useCallback(async (termsVersion) => {
    const token = readToken();
    if (!token) {
      setTermsOpen(false);
      setLoginOpen(true);
      return;
    }
    setSending(true);
    try {
      await enrollInCourse(id, token, { preferredLanguage: language, termsVersion, acceptTerms: true });
      saveLanguage(id, language);
      setTermsOpen(false);
      markEnrolled();
      if (open) navigate(`/curso/${id}`);
      else showToast(ENROLL.reservedLead, 'success');
    } catch (err) {
      if (err.status === 428 && err.body?.code === 'TERMS_REQUIRED') {
        // Las condiciones cambiaron mientras las leía: se recargan y se vuelven a pedir
        invalidateTerms();
        setTermsKey((k) => k + 1);
        showToast(ENROLL.termsChanged, 'info');
      } else if (err.status === 400 && err.body?.enrollment) {
        // Inscrito desde otra pestaña: se trata como éxito
        setTermsOpen(false);
        markEnrolled();
        if (open) navigate(`/curso/${id}`);
      } else {
        showToast(err.status === 400 && err.message ? err.message : ENROLL.error, 'error');
      }
    } finally {
      setSending(false);
    }
  }, [id, language, markEnrolled, navigate, open, showToast]);

  const act = useCallback(() => {
    if (sending || interest.sending || INERT_CTA.has(state)) return;
    if (state === 'interest') {
      if (user) sendInterest();
      else onAskEmail?.();
      return;
    }
    if (state === 'enrolled') {
      navigate(`/curso/${id}`);
      return;
    }
    if (!user) {
      setPending(true);
      setLoginOpen(true);
      return;
    }
    setTermsOpen(true);
  }, [id, interest.sending, navigate, onAskEmail, sendInterest, sending, state, user]);

  // Pidió inscribirse sin sesión: al entrar, se sigue en cuanto sabemos si ya estaba inscrito
  useEffect(() => {
    if (!pending || !user || enrollment.status !== 'ready') return;
    setPending(false);
    if (!enrollment.data?.enrolled) setTermsOpen(true);
  }, [pending, user, enrollment]);

  // Si cierra el acceso sin entrar, se olvida la intención (no se inscribe más tarde por sorpresa)
  const closeLogin = useCallback(() => {
    setLoginOpen(false);
    if (!readToken()) setPending(false);
  }, []);

  return {
    state,
    sending: sending || interest.sending,
    act,
    interest: { done: interest.done, sending: interest.sending, submit: sendInterest },
    login: { open: loginOpen, close: closeLogin },
    terms: { open: termsOpen, key: termsKey, close: () => setTermsOpen(false), confirm: submit },
  };
}
