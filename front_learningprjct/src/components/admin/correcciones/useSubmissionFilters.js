import useUrlFilters from '../shared/useUrlFilters';
import { submissionFilters } from './submissionQuery';

// Filtros del listado de entregas en la URL
export default function useSubmissionFilters() {
  return useUrlFilters(submissionFilters);
}
