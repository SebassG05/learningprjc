import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollInCourse, invalidateTerms, readToken } from '../../../lib/coursesApi';
import { useToast } from '../../../context/ToastContext';
import { ENROLL } from '../coursesCopy';
import { saveLanguage } from '../courseFormat';

/**
 * Lo que hace el botón principal de la ficha según el alumno y el curso:
 *   enroll / reserve  → sin sesión pide acceso (y sigue al entrar); con sesión, abre los términos
 *                       y se inscribe al confirmarlos (el backend rechaza sin aceptación válida)
 *   enrolled          → lleva al aula
 *   reserved          → curso aún cerrado y plaza ya reservada: no hace nada
 * El idioma elegido en la ficha viaja en la inscripción (antes no se enviaba y todos quedaban en español).
 */
export default function useEnrollAction({ course, user, enrollment, language, markEnrolled }) {
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
  const state = enrolled ? (open ? 'enrolled' : 'reserved') : open ? 'enroll' : 'reserve';

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
    if (sending || state === 'reserved') return;
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
  }, [id, navigate, sending, state, user]);

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
    sending,
    act,
    login: { open: loginOpen, close: closeLogin },
    terms: { open: termsOpen, key: termsKey, close: () => setTermsOpen(false), confirm: submit },
  };
}
