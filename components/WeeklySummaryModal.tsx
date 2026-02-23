import React from 'react';
import { X, Dumbbell, TrendingUp, Zap, TrendingDown, Share2 } from 'lucide-react';
import { WeeklySummaryData } from '../lib/weeklySummary';
import { shareWeeklySummary } from '../lib/share';
import { useApp } from '../context/AppContext';

interface Props {
  data: WeeklySummaryData;
  onClose: () => void;
}

function delta(current: number, previous: number): { value: number; positive: boolean } {
  const value = current - previous;
  return { value, positive: value >= 0 };
}

function DeltaChip({ current, previous, unit = '' }: { current: number; previous: number; unit?: string }) {
  const { value, positive } = delta(current, previous);
  if (previous === 0 || value === 0) return null;
  const fmt = unit === 'kg' && Math.abs(value) >= 1000
    ? `${positive ? '+' : ''}${(value / 1000).toFixed(1)}k kg`
    : `${positive ? '+' : ''}${value.toLocaleString('es-ES')}${unit ? ' ' + unit : ''}`;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${positive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
      {positive ? <TrendingUp className="inline w-3 h-3 mr-0.5" /> : <TrendingDown className="inline w-3 h-3 mr-0.5" />}
      {fmt}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  current,
  previous,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  current: number;
  previous: number;
  accent: string;
}) {
  return (
    <div className={`bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 flex flex-col gap-2`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-white">
        {value} <span className="text-sm font-medium text-gray-400">{unit}</span>
      </p>
      <DeltaChip current={current} previous={previous} unit={unit} />
    </div>
  );
}

const WeeklySummaryModal: React.FC<Props> = ({ data, onClose }) => {
  const { lastWeek, prevWeek } = data;
  const { user } = useApp();

  const lastWeekDate = new Date(lastWeek.weekStart);
  const weekLabel = lastWeekDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

  const volumeStr = lastWeek.volumeKg >= 1000
    ? (lastWeek.volumeKg / 1000).toFixed(1) + 'k'
    : String(lastWeek.volumeKg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background-card w-full max-w-md rounded-3xl border border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/30 to-purple-900/20 p-6 border-b border-gray-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 text-gray-400 hover:text-white hover:bg-black/50 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            Resumen semanal · semana del {weekLabel}
          </p>
          <h2 className="text-2xl font-black text-white">¿Cómo fue tu semana?</h2>
        </div>

        {/* Stats Grid */}
        <div className="p-6 grid grid-cols-3 gap-3">
          <StatCard
            icon={<Dumbbell className="w-5 h-5 text-blue-400" />}
            label="Entrenos"
            value={String(lastWeek.workouts)}
            current={lastWeek.workouts}
            previous={prevWeek.workouts}
            accent="bg-blue-500/10"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-green-400" />}
            label="Volumen"
            value={volumeStr}
            unit="kg"
            current={lastWeek.volumeKg}
            previous={prevWeek.volumeKg}
            accent="bg-green-500/10"
          />
          <StatCard
            icon={<Zap className="w-5 h-5 text-yellow-400" />}
            label="XP ganado"
            value={lastWeek.xpEarned.toLocaleString('es-ES')}
            current={lastWeek.xpEarned}
            previous={prevWeek.xpEarned}
            accent="bg-yellow-500/10"
          />
        </div>

        {/* Motivational footer */}
        <div className="px-6 pb-6">
          {lastWeek.workouts >= (prevWeek.workouts || 1) ? (
            <p className="text-center text-gray-300 text-sm mb-4">
              {lastWeek.workouts >= 4
                ? '¡Semana increíble! Sigue así. 🔥'
                : prevWeek.workouts > 0 && lastWeek.workouts >= prevWeek.workouts
                ? '¡Mejorando semana a semana! 💪'
                : '¡Buen trabajo! Cada sesión cuenta. 👊'}
            </p>
          ) : (
            <p className="text-center text-gray-400 text-sm mb-4">
              Esta semana viene con más fuerza. ¡Tú puedes! 💪
            </p>
          )}
          <div className="flex gap-3">
            {user && (
              <button
                onClick={() => shareWeeklySummary(data, user)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-bold rounded-xl transition-colors"
                title="Compartir resumen"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-primary hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
            >
              ¡A por esta semana!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryModal;
