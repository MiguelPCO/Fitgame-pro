import {
  Home,
  CalendarDays,
  LineChart,
  User,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from './constants';

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Pantallas del grupo. La primera es el destino al tocar la pestaña. */
  children: { route: string; label: string }[];
}

/**
 * Los 10 destinos del drawer se agrupan en 4 pestañas + el boton de accion
 * (05-arquitectura-ux.md §2). Cada pantalla sigue a <=2 toques: pestaña +
 * sub-pestaña.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'hoy',
    label: 'Hoy',
    icon: Home,
    children: [{ route: ROUTES.DASHBOARD, label: 'Hoy' }],
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: CalendarDays,
    children: [
      { route: ROUTES.SCHEDULE, label: 'Programa' },
      { route: ROUTES.TEMPLATES, label: 'Plantillas' },
      { route: ROUTES.PROGRAMS, label: 'Programas' },
    ],
  },
  {
    id: 'progreso',
    label: 'Progreso',
    icon: LineChart,
    children: [
      { route: ROUTES.PROGRESS, label: 'Progreso' },
      { route: ROUTES.HISTORY, label: 'Historial' },
    ],
  },
  {
    id: 'perfil',
    label: 'Perfil',
    icon: User,
    children: [
      { route: ROUTES.SETTINGS, label: 'Ajustes' },
      { route: ROUTES.CHALLENGES, label: 'Retos' },
      { route: ROUTES.EXERCISES, label: 'Ejercicios' },
    ],
  },
];

/** Grupo al que pertenece una pantalla, o undefined si vive fuera de las pestañas. */
export const findNavGroup = (page: string): NavGroup | undefined =>
  NAV_GROUPS.find((g) => g.children.some((c) => c.route === page));
