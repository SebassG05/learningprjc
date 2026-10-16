/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { acceptTerms, fetchTermsStatus, invalidateTerms, readToken } from '../../lib/coursesApi';
import { useToast } from '../../context/ToastContext';
import TermsDialog from './sheet/TermsDialog';
import { ENROLL } from './coursesCopy';

// En el aula: si el alumno inscrito no ha aceptado la versión vigente de las condiciones (porque
// cambiaron, o porque se inscribió antes de que existieran), se le piden antes de seguir.
// Cancelar lo devuelve a la ficha del curso. El backend también lo exige al servir el material.
export default function TermsGate({ courseId, courseTitle, enabled }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [needed, setNeeded] = useState(false);
  const [sending, setSending] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const token = readToken();
    if (!enabled || !token) return undefined;
    const ctrl = new AbortController();
    fetchTermsStatus(courseId, token, ctrl.signal)
      .then((s) => setNeeded(!s.accepted))
      .catch(() => {
        /* si no se puede comprobar, decide el backend al pedir el material */
      });
    return () => ctrl.abort();
  }, [courseId, enabled]);

  const confirm = async (version) => {
    setSending(true);
    try {
      await acceptTerms(courseId, readToken(), version);
      setNeeded(false);
    } catch (err) {
      if (err.body?.code === 'TERMS_REQUIRED') {
        invalidateTerms();
        setKey((k) => k + 1);
        showToast(ENROLL.termsChanged, 'info');
      } else {
        showToast(ENROLL.error, 'error');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <TermsDialog
      key={key}
      open={needed}
      mode="reaccept"
      courseTitle={courseTitle}
      sending={sending}
      onConfirm={confirm}
      onClose={() => navigate(`/curso/${courseId}/inscripcion`)}
    />
  );
}
