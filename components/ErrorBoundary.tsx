import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  declare state: State;
  declare setState: React.Component<Props, State>['setState'];

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info.componentStack);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-white">Algo salio mal</h1>
              <p className="text-sm text-gray-400 mt-2">
                Ha ocurrido un error inesperado. Puedes intentar recargar la pagina.
              </p>
            </div>

            {this.state.error && (
              <div className="px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-left">
                <p className="text-xs text-gray-500 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar pagina
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
