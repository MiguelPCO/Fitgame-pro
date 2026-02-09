import React, { useState, useEffect } from 'react';
import { Save, User, Target, Clock, Dumbbell, Shield, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { Goal, ExperienceLevel } from '../types';

const GOALS: { value: Goal; label: string; icon: string }[] = [
  { value: 'Strength', label: 'Fuerza', icon: '💪' },
  { value: 'Hypertrophy', label: 'Hipertrofia', icon: '🏋️' },
  { value: 'Fat Loss', label: 'Perder grasa', icon: '🔥' },
  { value: 'Endurance', label: 'Resistencia', icon: '🏃' },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'Beginner', label: 'Principiante' },
  { value: 'Intermediate', label: 'Intermedio' },
  { value: 'Advanced', label: 'Avanzado' },
];

const EQUIPMENT_OPTIONS = [
  'Gym Complete', 'Dumbbells Only', 'Barbell & Rack', 'Bodyweight', 'Resistance Bands', 'Home Gym',
];

const Settings: React.FC = () => {
  const { user, updateUser } = useApp();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [goal, setGoal] = useState<Goal>(user?.goal || 'Hypertrophy');
  const [daysPerWeek, setDaysPerWeek] = useState(user?.daysPerWeek || 4);
  const [minutesPerSession, setMinutesPerSession] = useState(user?.minutesPerSession || 60);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(user?.experienceLevel || 'Intermediate');
  const [equipment, setEquipment] = useState<string[]>(user?.equipment || []);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!user) return;
    const changed =
      name !== user.name ||
      goal !== user.goal ||
      daysPerWeek !== user.daysPerWeek ||
      minutesPerSession !== user.minutesPerSession ||
      experienceLevel !== user.experienceLevel ||
      JSON.stringify(equipment) !== JSON.stringify(user.equipment);
    setHasChanges(changed);
  }, [name, goal, daysPerWeek, minutesPerSession, experienceLevel, equipment, user]);

  const handleSave = () => {
    updateUser({ name, goal, daysPerWeek, minutesPerSession, experienceLevel, equipment });
    toast('Perfil actualizado', 'success');
    setHasChanges(false);
  };

  const toggleEquipment = (item: string) => {
    setEquipment(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    );
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Configuracion</h1>
          <p className="text-text-muted mt-1">Edita tu perfil y preferencias de entrenamiento.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          leftIcon={<Save className="w-5 h-5" />}
        >
          Guardar
        </Button>
      </div>

      {/* Profile Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Perfil</h2>
        </div>

        <div>
          <label className="text-sm font-medium text-text-muted block mb-1.5">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none transition-colors"
            placeholder="Tu nombre"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-background rounded-xl p-4 border border-gray-800">
            <p className="text-xs text-text-muted">Nivel</p>
            <p className="text-xl font-bold text-white mt-1">{user.level}</p>
          </div>
          <div className="bg-background rounded-xl p-4 border border-gray-800">
            <p className="text-xs text-text-muted">Tier</p>
            <p className="text-xl font-bold text-primary mt-1">{user.tier}</p>
          </div>
          <div className="bg-background rounded-xl p-4 border border-gray-800">
            <p className="text-xs text-text-muted">XP Total</p>
            <p className="text-xl font-bold text-white mt-1">{user.xp}</p>
          </div>
          <div className="bg-background rounded-xl p-4 border border-gray-800">
            <p className="text-xs text-text-muted">Racha</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{user.streak} dias</p>
          </div>
        </div>
      </Card>

      {/* Training Goal */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Objetivo</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map(g => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              className={cn(
                'p-4 rounded-xl border text-left transition-all',
                goal === g.value
                  ? 'border-primary bg-primary/10 text-white'
                  : 'border-gray-700 text-text-muted hover:border-gray-600'
              )}
            >
              <span className="text-xl">{g.icon}</span>
              <p className="font-medium mt-1.5">{g.label}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Training Preferences */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Preferencias</h2>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-text-muted">Dias por semana</label>
            <span className="text-sm font-bold text-white">{daysPerWeek}</span>
          </div>
          <input
            type="range"
            min={2}
            max={7}
            value={daysPerWeek}
            onChange={e => setDaysPerWeek(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>2</span><span>7</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-text-muted">Minutos por sesion</label>
            <span className="text-sm font-bold text-white">{minutesPerSession} min</span>
          </div>
          <input
            type="range"
            min={15}
            max={120}
            step={5}
            value={minutesPerSession}
            onChange={e => setMinutesPerSession(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>15</span><span>120</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-text-muted block mb-2">Nivel de experiencia</label>
          <div className="flex gap-3">
            {EXPERIENCE_LEVELS.map(l => (
              <button
                key={l.value}
                onClick={() => setExperienceLevel(l.value)}
                className={cn(
                  'flex-1 py-3 rounded-xl border text-sm font-medium transition-all',
                  experienceLevel === l.value
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-gray-700 text-text-muted hover:border-gray-600'
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Equipment */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Equipamiento</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EQUIPMENT_OPTIONS.map(item => (
            <button
              key={item}
              onClick={() => toggleEquipment(item)}
              className={cn(
                'px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                equipment.includes(item)
                  ? 'border-primary bg-primary/10 text-white'
                  : 'border-gray-700 text-text-muted hover:border-gray-600'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      {/* Account Section */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Cuenta</h2>
        </div>
        <p className="text-sm text-text-muted">{user.email || 'Sin email configurado'}</p>
        <div className="flex flex-col gap-2 pt-2">
          <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-gray-700 text-text-muted hover:text-white hover:border-gray-600 transition-all text-sm">
            <span>Cambiar contrasena</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-red-900/30 text-red-400 hover:bg-red-500/5 hover:border-red-800/50 transition-all text-sm">
            <span>Eliminar cuenta</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
