import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollInCourse, readToken } from '../../../lib/coursesApi';
import { useToast } from '../../../context/ToastContext';
import { ENROLL } from '../coursesCopy';
import { saveLanguage } from '../courseFormat';

/**
 * Lo que hace el botón principal de la ficha según el alumno y el curso:
 *   enroll / reserve  → sin sesión pide acceso (y sigue al entrar); con sesión, se inscribe
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

  const id = course?._id;
  const open = Boolean(course?.isOpen);
  const enrolled = Boolean(enrollment.data?.enrolled);
  const state = enrolled ? (open ? 'enrolled' : 'reserved') : open ? 'enroll' : 'reserve';

  const submit = useCallback(async () => {
    const token = readToken();
    if (!token) {
      setLoginOpen(true);
      return;
    }
    setSending(true);
    try {
      await enrollInCourse(id, token, { preferredLanguage: language });
      saveLanguage(id, language);
      markEnrolled();
      if (open) navigate(`/curso/${id}`);
      else showToast(ENROLL.reservedLead, 'success');
    } catch (err) {
      // Inscrito desde otra pestaña: se trata como éxito
      if (err.status === 400 && err.body?.enrollment) {
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
    submit();
  }, [id, navigate, sending, state, submit, user]);

  // Pidió inscribirse sin sesión: al entrar, se sigue en cuanto sabemos si ya estaba inscrito
  useEffect(() => {
    if (!pending || !user || enrollment.status !== 'ready') return;
    setPending(false);
    if (!enrollment.data?.enrolled) submit();
  }, [pending, user, enrollment, submit]);

  // Si cierra el acceso sin entrar, se olvida la intención (no se inscribe más tarde por sorpresa)
  const closeLogin = useCallback(() => {
    setLoginOpen(false);
    if (!readToken()) setPending(false);
  }, []);

  return { state, sending, act, login: { open: loginOpen, close: closeLogin } };
}
