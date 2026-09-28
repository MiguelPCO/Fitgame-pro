import { RunType } from '../../types';

/**
 * Etiquetas de los tipos de carrera (06-modelo-datos.md SS B). En su propio
 * fichero porque exportar una constante junto a un componente rompe el fast
 * refresh (react-refresh/only-export-components).
 */
export const RUN_TYPE_OPTIONS: { value: RunType; label: string }[] = [
  { value: 'easy', label: 'Suave' },
  { value: 'long', label: 'Larga' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'intervals', label: 'Series' },
  { value: 'recovery', label: 'Recuperacion' },
  { value: 'race', label: 'Carrera' },
];
