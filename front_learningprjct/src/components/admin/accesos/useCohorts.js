import { useCallback, useEffect, useState } from 'react';
import {
  addCohortMembers,
  createCohort,
  deleteCohort,
  fetchCohorts,
  removeCohortMember,
  updateCohort,
} from '../../../lib/adminApi';

// Cohortes de un curso y sus acciones. Cada acción devuelve la promesa (el componente da el aviso)
// y actualiza la lista local con lo que responde el servidor.
export default function useCohorts(courseId) {
  const [state, setState] = useState({ status: 'idle', cohorts: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!courseId) return undefined;
    const ctrl = new AbortController();
    setState((s) => ({ status: s.status === 'ready' ? 'refreshing' : 'loading', cohorts: s.status === 'ready' ? s.cohorts : [] }));
    fetchCohorts(courseId, ctrl.signal)
      .then((cohorts) => setState({ status: 'ready', cohorts }))
      .catch((err) => err.name !== 'AbortError' && setState({ status: 'error', cohorts: [] }));
    return () => ctrl.abort();
  }, [courseId, attempt]);

  const replace = (cohort) => setState((s) => ({ ...s, cohorts: s.cohorts.map((c) => (c._id === cohort._id ? cohort : c)) }));

  const create = useCallback(async (body) => {
    const cohort = await createCohort({ ...body, course: courseId });
    setState((s) => ({ ...s, cohorts: [cohort, ...s.cohorts] }));
    return cohort;
  }, [courseId]);

  const update = useCallback(async (id, body) => {
    const cohort = await updateCohort(id, body);
    replace(cohort);
    return cohort;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteCohort(id, { force: true });
    setState((s) => ({ ...s, cohorts: s.cohorts.filter((c) => c._id !== id) }));
  }, []);

  const addMembers = useCallback(async (id, emails, sendEmail) => {
    const { summary, cohort } = await addCohortMembers(id, emails, sendEmail);
    replace(cohort);
    return summary;
  }, []);

  const removeMember = useCallback(async (id, memberId) => {
    await removeCohortMember(id, memberId);
    setState((s) => ({
      ...s,
      cohorts: s.cohorts.map((c) => {
        if (c._id !== id) return c;
        const members = c.members.filter((m) => m._id !== memberId);
        const count = (status) => members.filter((m) => m.status === status).length;
        return { ...c, members, counts: { active: count('active'), pending: count('pending') } };
      }),
    }));
  }, []);

  return { ...state, reload: () => setAttempt((n) => n + 1), create, update, remove, addMembers, removeMember };
}
