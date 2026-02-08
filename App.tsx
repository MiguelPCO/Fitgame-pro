import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkoutPlayer from './pages/WorkoutPlayer';
import ExerciseLibrary from './pages/ExerciseLibrary';
import Progress from './pages/Progress';
import Onboarding from './pages/Onboarding';
import WorkoutSummary from './pages/WorkoutSummary';
import Templates from './pages/Templates';
import TemplateEditor from './pages/TemplateEditor';
import Schedule from './pages/Schedule';
import History from './pages/History';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ROUTES } from './lib/constants';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useApp();
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

  // Auto-redirect to onboarding if not completed
  if (user && user.onboardingCompleted !== true && currentView !== ROUTES.ONBOARDING) {
    return (
      <Layout currentPage={ROUTES.ONBOARDING} onNavigate={navigate}>
        <Onboarding onComplete={handleOnboardingComplete} />
      </Layout>
    );
  }

  // If user is authenticated but needs to set up plan, showing onboarding
  if (currentView === ROUTES.ONBOARDING) {
    return (
      <Layout currentPage={ROUTES.ONBOARDING} onNavigate={navigate}>
        <Onboarding onComplete={handleOnboardingComplete} />
      </Layout>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case ROUTES.DASHBOARD:
        return <Dashboard onStartWorkout={() => navigate(ROUTES.WORKOUT)} />;
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
      case ROUTES.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} />;
      default:
        return <Dashboard onStartWorkout={() => navigate(ROUTES.WORKOUT)} />;
    }
  };

  // Workout Player takes over the full screen
  if (currentView === ROUTES.WORKOUT) {
    return <div className="bg-background min-h-screen">{renderContent()}</div>;
  }

  // Template Editor also takes over, or at least no sidebar for focus
  if (currentView === ROUTES.TEMPLATE_EDITOR) {
    return <div className="bg-background min-h-screen p-4 md:p-8">{renderContent()}</div>;
  }

  return (
    <Layout currentPage={currentView} onNavigate={navigate}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
