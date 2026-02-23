import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Users, Copy, CheckCircle, X, Swords,
  Clock, Trophy, Wifi, WifiOff, RefreshCw, LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import {
  SocialChallenge, ChallengeParticipant, ChallengeType,
  CHALLENGE_TYPE_META,
  createChallenge, joinChallenge, getMyChallenges,
  updateMyProgress, leaveChallenge,
  computeProgress, isActive, timeRemaining,
  generateCode,
} from '../services/socialChallenges';
import { isSupabaseConfigured } from '../lib/supabase';

// ─── Create Modal ─────────────────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void;
  onCreated: (c: SocialChallenge, code: string) => void;
}

const DURATION_OPTIONS = [
  { label: '3 días', days: 3 },
  { label: '1 semana', days: 7 },
  { label: '2 semanas', days: 14 },
];

const CreateModal: React.FC<CreateModalProps> = ({ onClose, onCreated }) => {
  const { user } = useApp();
  const { showToast } = useToast();
  const [type, setType] = useState<ChallengeType>('workouts');
  const [target, setTarget] = useState(5);
  const [duration, setDuration] = useState(7);
  const [loading, setLoading] = useState(false);

  const meta = CHALLENGE_TYPE_META[type];

  const handleTypeChange = (t: ChallengeType) => {
    setType(t);
    setTarget(CHALLENGE_TYPE_META[t].options[1]);
  };

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    const result = await createChallenge({
      type,
      title: `Reto: ${meta.label} (${target} ${meta.unit})`,
      target,
      bonusXp: 150,
      durationDays: duration,
      user: user as typeof user & { id: string },
    });
    setLoading(false);
    if (!result) {
      showToast('Error al crear el reto. Comprueba tu conexión.', 'error');
      return;
    }
    onCreated(result, result.code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-background-card border border-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-black text-white">Crear Reto</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Type selector */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tipo de reto</p>
            <div className="space-y-2">
              {(Object.entries(CHALLENGE_TYPE_META) as [ChallengeType, typeof CHALLENGE_TYPE_META[ChallengeType]][]).map(
                ([key, m]) => (
                  <button
                    key={key}
                    onClick={() => handleTypeChange(key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      type === key
                        ? 'border-primary/60 bg-primary/10 text-white'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="font-semibold text-sm">{m.label}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Target */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Meta ({meta.unit})</p>
            <div className="flex gap-2 flex-wrap">
              {meta.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => setTarget(opt)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm border transition-all ${
                    target === opt
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {opt >= 1000 ? `${(opt / 1000).toFixed(0)}k` : opt}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Duración</p>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.days}
                  onClick={() => setDuration(opt.days)}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm border transition-all ${
                    duration === opt.days
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-red-700 text-white font-black rounded-2xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando…' : 'Crear y obtener código'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Join Modal ───────────────────────────────────────────────────────────────

interface JoinModalProps {
  onClose: () => void;
  onJoined: () => void;
}

const JoinModal: React.FC<JoinModalProps> = ({ onClose, onJoined }) => {
  const { user } = useApp();
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (code.trim().length < 6 || !user) return;
    setLoading(true);
    const result = await joinChallenge(
      code.trim(),
      user as typeof user & { id: string }
    );
    setLoading(false);
    if (!result) {
      showToast('Código no encontrado. Verifica e inténtalo de nuevo.', 'error');
      return;
    }
    showToast('¡Te has unido al reto! 🎯', 'success');
    onJoined();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-background-card border border-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white">Unirse a Reto</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Introduce el código de 6 caracteres que te compartió tu amigo.
        </p>

        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="Ej: ABC123"
          maxLength={6}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-2xl font-black tracking-widest uppercase focus:outline-none focus:border-primary transition-colors mb-4"
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
        />

        <button
          onClick={handleJoin}
          disabled={loading || code.length < 6}
          className="w-full py-4 bg-primary hover:bg-red-700 text-white font-black rounded-2xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Buscando…' : 'Unirse'}
        </button>
      </div>
    </div>
  );
};

// ─── Code Share Modal ─────────────────────────────────────────────────────────

interface CodeModalProps {
  code: string;
  onClose: () => void;
}

const CodeModal: React.FC<CodeModalProps> = ({ code, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(
      `¡Te reto en FitGame Pro! Únete con el código: ${code} 💪`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-background-card border border-gray-800 rounded-3xl shadow-2xl p-6 text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Swords className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-black text-white mb-1">¡Reto creado!</h2>
        <p className="text-gray-400 text-sm mb-6">Comparte este código con tu amigo para que se una</p>

        <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-5 mb-4">
          <p className="text-4xl font-black text-white tracking-widest">{code}</p>
        </div>

        <button
          onClick={copy}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-red-700 text-white font-bold rounded-xl transition-colors mb-3"
        >
          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? '¡Copiado!' : 'Copiar código'}
        </button>

        <button onClick={onClose} className="w-full py-3 text-gray-400 hover:text-white font-semibold transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  );
};

// ─── Challenge Card ───────────────────────────────────────────────────────────

interface ChallengeCardProps {
  challenge: SocialChallenge;
  myUserId: string;
  onLeave: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, myUserId, onLeave }) => {
  const meta = CHALLENGE_TYPE_META[challenge.type];
  const active = isActive(challenge);
  const remaining = timeRemaining(challenge);

  const participants: ChallengeParticipant[] =
    (challenge.participants ?? []).sort((a, b) => b.progress - a.progress);

  const myParticipant = participants.find(p => p.user_id === myUserId);
  const myProgress = myParticipant?.progress ?? 0;
  const myPct = challenge.target > 0
    ? Math.min(100, Math.round((myProgress / challenge.target) * 100))
    : 0;
  const myRank = participants.findIndex(p => p.user_id === myUserId) + 1;

  return (
    <div className="bg-background-card border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <h3 className="text-white font-bold text-sm leading-tight">{challenge.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                active
                  ? 'bg-green-500/15 text-green-400'
                  : 'bg-gray-500/15 text-gray-500'
              }`}>
                {active ? 'Activo' : 'Finalizado'}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" /> {remaining}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onLeave}
          className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Abandonar reto"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* My progress */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Mi progreso</span>
          <span className="text-xs font-bold text-white">
            {myProgress >= 1000 ? `${(myProgress / 1000).toFixed(1)}k` : myProgress}
            {' / '}
            {challenge.target >= 1000 ? `${(challenge.target / 1000).toFixed(0)}k` : challenge.target}
            {' '}{meta.unit}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-red-400 rounded-full transition-all duration-500"
            style={{ width: `${myPct}%` }}
          />
        </div>
        {myPct >= 100 && (
          <p className="text-xs text-green-400 font-bold mt-1.5 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> ¡Meta alcanzada! +{challenge.bonus_xp} XP
          </p>
        )}
      </div>

      {/* Leaderboard */}
      <div className="p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-3.5 h-3.5" /> Clasificación
        </p>
        <div className="space-y-2">
          {participants.slice(0, 5).map((p, i) => {
            const pct = Math.min(100, Math.round((p.progress / challenge.target) * 100));
            const isMe = p.user_id === myUserId;
            return (
              <div key={p.id} className={`flex items-center gap-3 ${isMe ? 'bg-primary/5 rounded-xl p-2 -mx-2' : ''}`}>
                <span className={`text-xs font-black w-5 text-center ${
                  i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold truncate ${isMe ? 'text-primary' : 'text-gray-300'}`}>
                      {p.user_name}{isMe ? ' (tú)' : ''}
                    </span>
                    <span className="text-xs text-gray-500 ml-2 shrink-0">
                      {p.progress >= 1000 ? `${(p.progress / 1000).toFixed(1)}k` : p.progress}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isMe ? 'bg-primary' : 'bg-gray-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code */}
      <div className="px-4 pb-4">
        <p className="text-center text-xs text-gray-600">
          Código de invitación: <span className="font-black text-gray-400 tracking-wider">{challenge.code}</span>
        </p>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const Challenges: React.FC = () => {
  const { user, workoutHistory } = useApp();
  const { showToast } = useToast();

  const [challenges, setChallenges] = useState<SocialChallenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [sharedCode, setSharedCode] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const userId = (user as (typeof user & { id?: string }) | null)?.id ?? '';

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const loadAndSync = useCallback(async () => {
    if (!userId || !isOnline) return;
    setLoading(true);
    const data = await getMyChallenges(userId);

    // Sync progress for active challenges
    for (const ch of data) {
      if (isActive(ch)) {
        const progress = computeProgress(
          ch.type, workoutHistory, user!, ch.starts_at, ch.ends_at
        );
        await updateMyProgress(ch.id, userId, progress);
        // Update local state too
        const me = (ch.participants ?? []).find(p => p.user_id === userId);
        if (me) me.progress = progress;
      }
    }

    setChallenges(data);
    setLoading(false);
  }, [userId, isOnline, workoutHistory, user]);

  useEffect(() => { loadAndSync(); }, [loadAndSync]);

  const handleCreated = (challenge: SocialChallenge, code: string) => {
    setShowCreate(false);
    setSharedCode(code);
    loadAndSync();
  };

  const handleLeave = async (challengeId: string) => {
    if (!userId) return;
    await leaveChallenge(challengeId, userId);
    setChallenges(prev => prev.filter(c => c.id !== challengeId));
    showToast('Has abandonado el reto.', 'success');
  };

  const supabaseAvailable = isSupabaseConfigured();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Retos</h1>
          <p className="text-gray-400 mt-1 text-sm">Compite con amigos en desafíos semanales</p>
        </div>
        {isOnline && (
          <button
            onClick={loadAndSync}
            disabled={loading}
            className="p-2.5 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Offline / no Supabase warning */}
      {(!isOnline || !supabaseAvailable) && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-yellow-400 shrink-0" />
          <div>
            <p className="text-yellow-300 text-sm font-bold">
              {!supabaseAvailable ? 'Supabase no configurado' : 'Sin conexión'}
            </p>
            <p className="text-yellow-400/70 text-xs">
              Los retos sociales requieren conexión a internet y Supabase activo.
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {supabaseAvailable && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowCreate(true)}
            className="flex flex-col items-center gap-2 p-5 bg-background-card border border-gray-800 hover:border-primary/40 rounded-2xl transition-all group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <span className="text-white font-bold text-sm">Crear Reto</span>
            <span className="text-gray-500 text-xs text-center">Genera un código e invita a un amigo</span>
          </button>

          <button
            onClick={() => setShowJoin(true)}
            className="flex flex-col items-center gap-2 p-5 bg-background-card border border-gray-800 hover:border-blue-500/40 rounded-2xl transition-all group"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Swords className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-white font-bold text-sm">Unirse a Reto</span>
            <span className="text-gray-500 text-xs text-center">Introduce el código de un amigo</span>
          </button>
        </div>
      )}

      {/* Challenge list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Sin retos activos</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Crea un reto y comparte el código con un amigo para empezar a competir.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Mis retos ({challenges.length})
          </p>
          {challenges.map(ch => (
            <ChallengeCard
              key={ch.id}
              challenge={ch}
              myUserId={userId}
              onLeave={() => handleLeave(ch.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
      {showJoin && (
        <JoinModal
          onClose={() => setShowJoin(false)}
          onJoined={loadAndSync}
        />
      )}
      {sharedCode && (
        <CodeModal
          code={sharedCode}
          onClose={() => setSharedCode(null)}
        />
      )}
    </div>
  );
};

export default Challenges;
