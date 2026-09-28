import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { ROUTES } from './lib/constants';
import { InstallBanner } from './components/InstallBanner';
import { checkAndSendReminder, notifyStreakAtRisk, notifyWeeklySummary } from './lib/notifications';
import { DashboardSkeleton, ProgressSkeleton, HistorySkeleton } from './components/ui/Skeleton';
import WeeklySummaryModal from './components/WeeklySummaryModal';
import { getWeeklySummaryData, shouldShowWeeklySummary, markWeeklySummaryShown } from './lib/weeklySummary';
import type { WeeklySummaryData } from './lib/weeklySummary';
import { getWeekStart, hasCompletedSessionInWeek, isNearWeekEnd } from './lib/challenges';
import { useToast } from './components/ui/Toast';

// Lazy-loaded page components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const WorkoutPlayer = React.lazy(() => import('./pages/WorkoutPlayer'));
const ExerciseLibrary = React.lazy(() => import('./pages/ExerciseLibrary'));
const Progress = React.lazy(() => import('./pages/Progress'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const WorkoutSummary = React.lazy(() => import('./pages/WorkoutSummary'));
const Templates = React.lazy(() => import('./pages/Templates'));
const TemplateEditor = React.lazy(() => import('./pages/TemplateEditor'));
const Schedule = React.lazy(() => import('./pages/Schedule'));
const History = React.lazy(() => import('./pages/History'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Programs = React.lazy(() => import('./pages/Programs'));
const Challenges = React.lazy(() => import('./pages/Challenges'));
const Legal = React.lazy(() => import('./pages/Legal'));
const RunLogger = React.lazy(() => import('./pages/RunLogger'));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user, workoutHistory } = useApp();
  const { toast } = useToast();

  // Vuelta del callback de Strava (Fase 7): la Edge Function redirige aqui con
  // ?strava=connected|error (no hay ruta propia, la app sigue enrutando por
  // estado — ver supabase/functions/strava-oauth). Se lee una vez al arrancar
  // y se limpia la URL para que recargar no repita el aviso.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const strava = params.get('strava');
    if (!strava) return;

    if (strava === 'connected') toast('Conectado con Strava', 'success');
    else if (strava === 'error') toast('No se pudo conectar con Strava', 'error');

    params.delete('strava');
    const rest = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''));
  }, [toast]);

  const hasWorkedOutToday = useMemo(() => {
    const today = new Date().toDateString();
    return workoutHistory.some(
      (s) => s.endTime && new Date(s.endTime).toDateString() === today
    );
  }, [workoutHistory]);

  // Racha semanal (Fase 6): en riesgo solo cerca del cierre de semana, no a
  // diario, o el aviso se convierte en spam (07-plan-implementacion.md Fase 6).
  const streakAtRisk = useMemo(
    () => isNearWeekEnd() && !hasCompletedSessionInWeek(workoutHistory, getWeekStart()) && (user?.streak || 0) > 0,
    [workoutHistory, user?.streak]
  );

  // Weekly summary modal
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryData | null>(null);

  useEffect(() => {
    if (!isAuthenticated || workoutHistory.length === 0) return;
    if (!shouldShowWeeklySummary()) return;
    const data = getWeeklySummaryData(workoutHistory);
    if (data) {
      setWeeklySummary(data);
      notifyWeeklySummary(data.lastWeek.workouts, data.lastWeek.volumeKg);
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCloseSummary = () => {
    markWeeklySummaryShown();
    setWeeklySummary(null);
  };

  // Reminder + streak-at-risk push notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    checkAndSendReminder(hasWorkedOutToday);
    if (streakAtRisk) notifyStreakAtRisk();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndSendReminder(hasWorkedOutToday);
        if (streakAtRisk) notifyStreakAtRisk();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isAuthenticated, hasWorkedOutToday, streakAtRisk]);

  const [currentView, setCurrentView] = useState(ROUTES.DASHBOARD);
  const [previousView, setPreviousView] = useState(ROUTES.DASHBOARD);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    if (authView === 'signup') {
      return <Signup onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToSignup={() => setAuthView('signup')} />;
  }

  const navigate = (view: string) => {
    setPreviousView(currentView);
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const handleOnboardingComplete = () => {
    navigate(ROUTES.DASHBOARD);
  };

  // El onboarding es una puerta: sin navegacion, no se puede saltar.
  const needsOnboarding = !!user && user.onboardingCompleted !== true;
  if (needsOnboarding || currentView === ROUTES.ONBOARDING) {
    return (
      <div className="bg-background min-h-screen animate-fade-in">
        <Suspense fallback={<PageLoader />}>
          <Onboarding onComplete={handleOnboardingComplete} />
        </Suspense>
      </div>
    );
  }

  const getPageFallback = () => {
    switch (currentView) {
      case ROUTES.DASHBOARD: return <DashboardSkeleton />;
      case ROUTES.PROGRESS: return <ProgressSkeleton />;
      case ROUTES.HISTORY: return <HistorySkeleton />;
      default: return <PageLoader />;
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case ROUTES.DASHBOARD:
        return <Dashboard onStartWorkout={() => navigate(ROUTES.WORKOUT)} onNavigateProgress={() => navigate(ROUTES.PROGRESS)} onNavigateTemplates={() => navigate(ROUTES.TEMPLATES)} onNavigateSchedule={() => navigate(ROUTES.SCHEDULE)} onNavigateSettings={() => navigate(ROUTES.SETTINGS)} />;
      case ROUTES.TEMPLATES:
        return (
          <Templates
            onCreate={() => { setEditingTemplateId(null); navigate(ROUTES.TEMPLATE_EDITOR); }}
            onEdit={(id) => { setEditingTemplateId(id); navigate(ROUTES.TEMPLATE_EDITOR); }}
            onStart={() => navigate(ROUTES.WORKOUT)}
          />
        );
      case ROUTES.TEMPLATE_EDITOR:
        return (
          <TemplateEditor
            editId={editingTemplateId}
            onClose={() => navigate(ROUTES.TEMPLATES)}
          />
        );
      case ROUTES.WORKOUT:
        return <WorkoutPlayer onFinish={() => navigate(ROUTES.DASHBOARD)} onBack={() => navigate(previousView)} />;
      case ROUTES.SUMMARY:
        return <WorkoutSummary onHome={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.SCHEDULE:
        return <Schedule />;
      case ROUTES.EXERCISES:
        return <ExerciseLibrary />;
      case ROUTES.PROGRESS:
        return <Progress />;
      case ROUTES.HISTORY:
        return <History />;
      case ROUTES.SETTINGS:
        return <Settings />;
      case ROUTES.PROGRAMS:
        return <Programs />;
      case ROUTES.CHALLENGES:
        return <Challenges />;
      case ROUTES.RUN_LOGGER:
        return <RunLogger onDone={() => navigate(ROUTES.DASHBOARD)} />;
      case ROUTES.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} />;
      default:
        return <Dashboard onStartWorkout={() => navigate(ROUTES.WORKOUT)} onNavigateProgress={() => navigate(ROUTES.PROGRESS)} onNavigateTemplates={() => navigate(ROUTES.TEMPLATES)} onNavigateSchedule={() => navigate(ROUTES.SCHEDULE)} onNavigateSettings={() => navigate(ROUTES.SETTINGS)} />;
    }
  };

  // Workout Player takes over the full screen
  if (currentView === ROUTES.WORKOUT) {
    return (
      <>
        <Suspense fallback={<PageLoader />}>
          <div className="bg-background min-h-screen animate-fade-in">{renderContent()}</div>
        </Suspense>
        {weeklySummary && <WeeklySummaryModal data={weeklySummary} onClose={handleCloseSummary} />}
      </>
    );
  }

  // Template Editor also takes over, or at least no sidebar for focus
  if (currentView === ROUTES.TEMPLATE_EDITOR) {
    return (
      <>
        <Suspense fallback={<PageLoader />}>
          <div className="bg-background min-h-screen p-4 md:p-8 animate-fade-in">{renderContent()}</div>
        </Suspense>
        {weeklySummary && <WeeklySummaryModal data={weeklySummary} onClose={handleCloseSummary} />}
      </>
    );
  }

  return (
    <>
      <Layout currentPage={currentView} onNavigate={navigate}>
        <Suspense fallback={getPageFallback()}>
          <div key={currentView} className="animate-fade-in-up">
            {renderContent()}
          </div>
        </Suspense>
      </Layout>
      {weeklySummary && <WeeklySummaryModal data={weeklySummary} onClose={handleCloseSummary} />}
    </>
  );
};

const App: React.FC = () => {
  // Sin router: las páginas legales van por URL y son públicas (vercel.json
  // reescribe cualquier ruta a index.html).
  const path = window.location.pathname.replace(/\/$/, '');
  if (path === '/privacidad' || path === '/aviso-legal') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Legal page={path.slice(1) as 'privacidad' | 'aviso-legal'} />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <AppContent />
          <InstallBanner />
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
