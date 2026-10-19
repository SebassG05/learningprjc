// Pestañas del panel de administración: clave en la URL (?tab=), etiqueta y texto de cabecera.
import { BarChart3, FileCheck2, Settings2, Users } from 'lucide-react';

export const ADMIN_TABS = [
  {
    key: 'correcciones',
    label: 'Correcciones',
    icon: FileCheck2,
    title: 'Correcciones',
    description: 'Revisa y califica las entregas. Lo pendiente más antiguo aparece primero.',
  },
  {
    key: 'reservas',
    label: 'Reservas',
    icon: Users,
    title: 'Reservas',
    description: 'Quién se ha inscrito en cada curso y cuándo.',
  },
  {
    key: 'progreso',
    label: 'Progreso',
    icon: BarChart3,
    title: 'Progreso del curso',
    description: 'Avance, entregas y nota media de cada alumno.',
  },
  {
    key: 'gestion',
    label: 'Gestión de cursos',
    icon: Settings2,
    title: 'Gestión de cursos',
    description: 'Crea, edita y ordena los cursos y sus temas.',
  },
];

export const DEFAULT_TAB = ADMIN_TABS[0].key;
export const tabByKey = (key) => ADMIN_TABS.find((t) => t.key === key) ?? ADMIN_TABS[0];
export const tabId = (key) => `admin-tab-${key}`;
export const panelId = (key) => `admin-panel-${key}`;
