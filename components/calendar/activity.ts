import { ArrowRightLeft, Check, Circle, CircleSlash2, Coffee, Dumbbell, Footprints, StretchHorizontal } from 'lucide-react';
import { ActivityType, ScheduledStatus } from '../../types';

/**
 * Icono + etiqueta + color por tipo y por estado.
 *
 * El color nunca va solo: cada sesion lleva icono y texto, porque un calendario
 * que solo distingue por color es inutilizable para un daltonico
 * (05-arquitectura-ux.md SS 4.2). Los colores salen de los tokens de tipo de
 * entreno de 04-design-system.md SS 3, que ya cumplen AA en claro y oscuro.
 */

export interface ActivityStyle {
  label: string;
  icon: typeof Dumbbell;
  /** Clase de color de texto/icono. */
  text: string;
  /** Clase de fondo tenue para rellenos. */
  bg: string;
  /** Clase de borde. */
  border: string;
  /** Clase de fondo solido para la barra vertical de la tarjeta. */
  bar: string;
}

export const ACTIVITY: Record<ActivityType, ActivityStyle> = {
  strength: {
    label: 'Fuerza', icon: Dumbbell,
    text: 'text-strength', bg: 'bg-strength/10', border: 'border-strength/40', bar: 'bg-strength',
  },
  run: {
    label: 'Carrera', icon: Footprints,
    text: 'text-cardio', bg: 'bg-cardio/10', border: 'border-cardio/40', bar: 'bg-cardio',
  },
  mobility: {
    label: 'Movilidad', icon: StretchHorizontal,
    text: 'text-mobility', bg: 'bg-mobility/10', border: 'border-mobility/40', bar: 'bg-mobility',
  },
  rest: {
    label: 'Descanso', icon: Coffee,
    text: 'text-rest', bg: 'bg-rest/10', border: 'border-rest/40', bar: 'bg-rest',
  },
};

export interface StatusStyle {
  label: string;
  icon: typeof Check;
}

export const STATUS: Record<ScheduledStatus, StatusStyle> = {
  planned: { label: 'Planificado', icon: Circle },
  completed: { label: 'Completado', icon: Check },
  skipped: { label: 'Saltado', icon: CircleSlash2 },
  moved: { label: 'Movido', icon: ArrowRightLeft },
};

/** Texto completo para lectores de pantalla: tipo, titulo y estado, sin depender del color. */
export const describeSession = (title: string, type: ActivityType, status: ScheduledStatus): string =>
  `${title}, ${ACTIVITY[type].label}, ${STATUS[status].label}`;
