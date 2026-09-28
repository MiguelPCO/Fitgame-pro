import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  LineChart,
  Users,
  Settings,
  LogOut,
  ClipboardList,
  CalendarDays,
  History,
  BookOpen,
  Swords,
  PlayCircle,
  CalendarPlus,
  Footprints,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { USER_DEFAULTS, ROUTES } from '../lib/constants';
import SyncIndicator from './SyncIndicator';
import BottomNav from './nav/BottomNav';
import { findNavGroup } from '../lib/navigation';
import { Sheet } from './ui/Sheet';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useApp();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Scroll to top when page changes to fix lost scroll context (Error #2)
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [currentPage]);

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'templates', label: 'Plantillas', icon: ClipboardList },
    { id: 'schedule', label: 'Programa', icon: CalendarDays },
    { id: 'programs', label: 'Programas', icon: BookOpen },
    { id: 'challenges', label: 'Retos', icon: Swords },
    { id: 'workout', label: 'Entrenamiento', icon: Dumbbell, highlight: true },
    { id: 'run-logger', label: 'Registrar carrera', icon: Footprints },
    { id: 'exercises', label: 'Ejercicios', icon: Users },
    { id: 'progress', label: 'Progreso', icon: LineChart },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const pageLabel =
    navItems.find((n) => n.id === currentPage)?.label ?? currentPage.replace('-', ' ');

  // Grupo de la barra inferior al que pertenece la pantalla actual.
  const activeGroup = findNavGroup(currentPage);
  const sectionTabs = activeGroup && activeGroup.children.length > 1 ? activeGroup.children : null;

  const goTo = (page: string) => {
    setIsActionSheetOpen(false);
    onNavigate(page);
  };

  const quickActions = [
    {
      icon: PlayCircle,
      label: 'Empezar entreno libre',
      description: 'Registrar una sesión que no está en el plan',
      route: ROUTES.WORKOUT,
    },
    {
      icon: ClipboardList,
      label: 'Elegir rutina',
      description: 'Empezar desde una de tus plantillas',
      route: ROUTES.TEMPLATES,
    },
    {
      icon: CalendarPlus,
      label: 'Añadir sesión al plan',
      description: 'Programar un día de la semana',
      route: ROUTES.SCHEDULE,
    },
    {
      icon: Footprints,
      label: 'Registrar carrera',
      description: 'Distancia, duración y esfuerzo de una carrera ya hecha',
      route: ROUTES.RUN_LOGGER,
    },
  ];

  return (
    <div className="flex h-screen bg-transparent text-text-main overflow-hidden">
      {/* Skip navigation link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-ink focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Saltar al contenido
      </a>

      {/* Sidebar: solo escritorio. En movil la sustituye la barra inferior. */}
      <aside className="hidden md:flex md:static inset-y-0 left-0 z-50 w-64 bg-background-card/95 backdrop-blur-xl border-r border-divider flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Dumbbell className="text-primary-ink w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Hybrid<span className="text-primary">Pro</span></h1>
        </div>

        <nav aria-label="Navegación lateral" className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${currentPage === item.id
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-primary'
                  : 'text-text-muted hover:bg-background-lighter/50 hover:text-white'
                }
              `}
            >
              <item.icon
                className={`w-5 h-5 ${currentPage === item.id ? 'text-primary' : 'group-hover:text-white text-gray-400'}`}
              />
              <span className="font-medium">{item.label}</span>
              {item.highlight && (
                <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow-primary" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-divider/50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-text-muted hover:text-red-400 transition-colors hover:bg-red-500/5 rounded-xl"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Cabecera: 48px en movil, 64px en escritorio */}
        <header className="h-12 md:h-16 border-b border-divider/50 bg-background/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-30 sticky top-0 shrink-0">
          <h2 className="md:hidden text-base font-bold text-text-main truncate">{pageLabel}</h2>

          <div className="hidden md:flex items-center gap-4 text-sm text-text-muted">
             <span>Inicio</span>
             <span className="text-gray-400">/</span>
             <span className="text-white capitalize font-medium">{pageLabel}</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <SyncIndicator />

            {/* En movil la sesion se cierra desde Perfil, que es donde vive la cuenta */}
            {activeGroup?.id === 'perfil' && (
              <button
                onClick={logout}
                aria-label="Cerrar sesión"
                className="md:hidden min-w-11 min-h-11 flex items-center justify-center rounded-lg text-text-muted hover:text-danger transition-colors duration-fast"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
              </button>
            )}

            <div className="hidden md:block w-px h-6 bg-gray-800"></div>

            <div className="hidden md:flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-sm font-bold text-white leading-none">{user?.name || USER_DEFAULTS.NAME}</p>
                <p className="text-xs text-primary font-medium mt-1">Lvl {user?.level || USER_DEFAULTS.LEVEL} {user?.tier || USER_DEFAULTS.TIER}</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-divider p-0.5 bg-background-card overflow-hidden shadow-lg">
                <img src={user?.avatarUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23374151' width='100' height='100'/%3E%3Ctext x='50' y='58' text-anchor='middle' fill='%239CA3AF' font-size='40' font-family='sans-serif'%3E%F0%9F%8F%8B%3C/text%3E%3C/svg%3E"} alt="Profile" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Sub-pestañas del grupo activo: lo que mantiene cada pantalla a <=2 toques */}
        {sectionTabs && (
          <nav
            aria-label={`Secciones de ${activeGroup.label}`}
            className="md:hidden sticky top-12 z-20 border-b border-divider/50 bg-background/80 backdrop-blur-md shrink-0"
          >
            <div className="flex gap-2 px-4 py-2 overflow-x-auto">
              {sectionTabs.map((tab) => (
                <button
                  key={tab.route}
                  onClick={() => onNavigate(tab.route)}
                  aria-current={currentPage === tab.route ? 'page' : undefined}
                  className={`min-h-11 px-4 rounded-full text-sm whitespace-nowrap transition-colors duration-fast
                    ${currentPage === tab.route
                      ? 'bg-primary text-primary-ink font-bold'
                      : 'bg-surface-raised text-text-secondary'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* Page Content */}
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 pb-[calc(88px+env(safe-area-inset-bottom))] md:p-8 scroll-smooth outline-none"
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <BottomNav
        currentPage={currentPage}
        onNavigate={onNavigate}
        onAction={() => setIsActionSheetOpen(true)}
      />

      <Sheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        title="Acciones rápidas"
      >
        <div className="p-4 space-y-2">
          {quickActions.map((action) => (
            <button
              key={action.route}
              onClick={() => goTo(action.route)}
              className="w-full min-h-11 flex items-center gap-4 p-4 rounded-xl bg-surface-raised text-left hover:bg-primary/10 transition-colors duration-fast"
            >
              <action.icon className="w-6 h-6 text-primary shrink-0" aria-hidden="true" />
              <span>
                <span className="block font-bold text-text-main">{action.label}</span>
                <span className="block text-sm text-text-muted">{action.description}</span>
              </span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
};

export default Layout;
