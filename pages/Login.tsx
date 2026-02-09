import React, { useState } from 'react';
import { Dumbbell, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { signIn, resetPassword } from '../services/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

interface LoginProps {
  onSwitchToSignup?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (isSupabaseConfigured()) {
      // Use Supabase Auth
      const result = await signIn(email, password);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      // Auth state change will trigger context update
      setIsLoading(false);
    } else {
      // Fallback to mock login (development without Supabase)
      setTimeout(() => {
        login(email);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Ingresa tu email primero');
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await resetPassword(email);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setResetSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <Dumbbell className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">FitGame<span className="text-primary">Pro</span></h1>
          <p className="text-text-muted">Enter the arena. Level up your life.</p>
        </div>

        <Card padding="lg" className="backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-bold text-gray-300 ml-1">Email</label>
              <Input
                id="login-email"
                type="email"
                required
                placeholder="warrior@fitgame.pro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!showForgotPassword && (
              <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-bold text-gray-300 ml-1">Password</label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {showForgotPassword ? (
              resetSent ? (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center">
                  Email enviado. Revisa tu bandeja de entrada para restablecer tu contrasena.
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setResetSent(false); setError(null); }}
                    className="block mx-auto mt-3 text-primary font-bold hover:underline"
                  >
                    Volver al login
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-text-muted">Ingresa tu email y te enviaremos un enlace para restablecer tu contrasena.</p>
                  <Button
                    type="button"
                    fullWidth
                    size="lg"
                    isLoading={isLoading}
                    onClick={handleForgotPassword}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar enlace'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setError(null); }}
                    className="w-full text-sm text-text-muted hover:text-white transition-colors"
                  >
                    Volver al login
                  </button>
                </div>
              )
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setError(null); }}
                    className="text-xs text-text-muted hover:text-primary transition-colors"
                  >
                    Olvidaste tu contrasena?
                  </button>
                </div>
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={!isLoading ? <ArrowRight className="w-5 h-5" /> : undefined}
                >
                  {isLoading ? 'Authenticating...' : 'Start Training'}
                </Button>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-primary font-bold hover:underline"
              >
                Create account
              </button>
            </p>
          </div>

          {!isSupabaseConfigured() && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xs text-center">
              Running in offline mode (Supabase not configured)
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;
