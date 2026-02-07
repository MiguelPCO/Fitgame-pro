import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  LineChart,
  Users,
  Settings,
  LogOut,
  Menu,
  ClipboardList,
  CalendarDays,
  History
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import SyncIndicator from './SyncIndicator';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Scroll to top when page changes to fix lost scroll context (Error #2)
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [currentPage]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'templates', label: 'Templates', icon: ClipboardList },
    { id: 'schedule', label: 'Programa', icon: CalendarDays },
    { id: 'workout', label: 'Active Workout', icon: Dumbbell, highlight: true },
    { id: 'exercises', label: 'Exercises', icon: Users },
    { id: 'progress', label: 'Progress', icon: LineChart },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'onboarding', label: 'Plan Setup', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-transparent text-text-main overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-background-card/95 backdrop-blur-xl border-r border-gray-800 
        transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 flex flex-col
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Dumbbell className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">FitGame<span className="text-primary">Pro</span></h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${currentPage === item.id 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                  : 'text-text-muted hover:bg-background-lighter/50 hover:text-white'
                }
              `}
            >
              <item.icon 
                className={`w-5 h-5 ${currentPage === item.id ? 'text-primary' : 'group-hover:text-white text-gray-500'}`} 
              />
              <span className="font-medium">{item.label}</span>
              {item.highlight && (
                <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#DC2626]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800/50">
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
        {/* Header */}
        <header className="h-16 border-b border-gray-800/50 bg-background/50 backdrop-blur-md flex items-center justify-between px-6 z-30 sticky top-0">
          <button 
            className="md:hidden p-2 text-text-muted hover:text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden md:flex items-center gap-4 text-sm text-text-muted">
             <span>Dashboard</span>
             <span className="text-gray-700">/</span>
             <span className="text-white capitalize font-medium">{currentPage.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden md:block">
              <SyncIndicator />
            </div>
            
            <div className="w-px h-6 bg-gray-800 hidden md:block"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">{user?.name || 'Guest User'}</p>
                <p className="text-xs text-primary font-medium mt-1">Lvl {user?.level || 1} {user?.tier || 'Novice'}</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-gray-700 p-0.5 bg-background-card overflow-hidden shadow-lg">
                <img src={user?.avatarUrl || "https://picsum.photos/100/100"} alt="Profile" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main 
          ref={mainRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth"
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;