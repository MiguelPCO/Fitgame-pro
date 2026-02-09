import React, { useState } from 'react';
import { Dumbbell, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { signUp } from '../services/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

interface SignupProps {
  onSwitchToLogin?: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!isSupabaseConfigured()) {
      setError('Supabase not configured. Cannot create account in offline mode.');
      return;
    }

    setIsLoading(true);

    const result = await signUp(email, password, name);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px]"></div>

        <div className="w-full max-w-md z-10 space-y-8">
          <Card padding="lg" className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Check your email!</h2>
            <p className="text-text-muted mb-6">
              We've sent a confirmation link to <span className="text-white font-bold">{email}</span>
            </p>
            <Button onClick={onSwitchToLogin} fullWidth>
              Back to Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <Dumbbell className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Join <span className="text-primary">FitGame</span></h1>
          <p className="text-text-muted">Create your account and start training</p>
        </div>

        <Card padding="lg" className="backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="signup-name" className="text-sm font-bold text-gray-300 ml-1">Name</label>
              <Input
                id="signup-name"
                type="text"
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-email" className="text-sm font-bold text-gray-300 ml-1">Email</label>
              <Input
                id="signup-email"
                type="email"
                required
                placeholder="warrior@fitgame.pro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-password" className="text-sm font-bold text-gray-300 ml-1">Password</label>
              <Input
                id="signup-password"
                type="password"
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-confirm" className="text-sm font-bold text-gray-300 ml-1">Confirm Password</label>
              <Input
                id="signup-confirm"
                type="password"
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              rightIcon={!isLoading ? <ArrowRight className="w-5 h-5" /> : undefined}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-primary font-bold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
