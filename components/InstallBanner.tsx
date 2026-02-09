import React from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export const InstallBanner: React.FC = () => {
  const { canInstall, install, dismiss } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-background-card border border-background-lighter rounded-xl p-4 shadow-lg shadow-black/30 flex items-center gap-3 animate-slide-up">
      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
        <Download className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-main">Instalar FitGame Pro</p>
        <p className="text-xs text-text-muted">Accede mas rapido desde tu pantalla de inicio</p>
      </div>
      <button
        onClick={install}
        className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
      >
        Instalar
      </button>
      <button
        onClick={dismiss}
        className="p-1 text-text-muted hover:text-text-main transition-colors flex-shrink-0"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
