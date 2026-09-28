import React from 'react';
import { Plus } from 'lucide-react';
import { NAV_GROUPS, findNavGroup, type NavGroup } from '../../lib/navigation';
import { cn } from '../../lib/utils';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  /** Abre la hoja de acciones del boton central. */
  onAction: () => void;
}

/**
 * Barra inferior de movil: 56px de alto mas la safe area del iPhone.
 * Oculta desde md: en escritorio manda la sidebar (05-arquitectura-ux.md §7).
 */
const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate, onAction }) => {
  const activeGroup = findNavGroup(currentPage);
  const [left, right] = [NAV_GROUPS.slice(0, 2), NAV_GROUPS.slice(2)];

  const renderTab = (group: NavGroup) => {
    const isActive = activeGroup?.id === group.id;
    return (
      <button
        key={group.id}
        type="button"
        onClick={() => onNavigate(group.children[0].route)}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 h-14 min-h-11 px-1',
          'transition-colors duration-fast',
          isActive ? 'text-primary' : 'text-text-muted'
        )}
      >
        <group.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
        <span className={cn('text-2xs leading-none', isActive && 'font-bold')}>{group.label}</span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Navegación principal"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background-card/95 backdrop-blur-xl border-t border-divider pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 items-end">
        {left.map(renderTab)}

        {/* No es una pestaña, es una accion: registrar fuera del plan a un toque */}
        <div className="flex items-start justify-center h-14">
          <button
            type="button"
            onClick={onAction}
            aria-label="Acciones rápidas"
            className="-mt-5 w-14 h-14 rounded-full bg-primary text-primary-ink shadow-glow-primary flex items-center justify-center active:scale-95 transition-transform duration-fast"
          >
            <Plus className="w-7 h-7" aria-hidden="true" />
          </button>
        </div>

        {right.map(renderTab)}
      </div>
    </nav>
  );
};

export default BottomNav;
