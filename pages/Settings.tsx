import React, { useState, useEffect } from 'react';
import { Save, User, Target, Clock, Dumbbell, Shield, ChevronRight, Download, FileText, Bell, Sun, Moon, Monitor } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exerciseBlueprints } from '../data/exerciseBlueprints';
import { useToast } from '../components/ui/Toast';
import { resetPassword, deleteAccount } from '../services/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { STORAGE_KEYS } from '../lib/constants';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { Goal, ExperienceLevel } from '../types';
import { useTheme, ThemeMode } from '../hooks/useTheme';
import {
  getReminderSettings,
  saveReminderSettings,
  getNotificationPermission,
  requestNotificationPermission,
  ReminderSettings,
} from '../lib/notifications';

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
  const { user, updateUser, workoutHistory } = useApp();
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

  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const [isSaving, setIsSaving] = useState(false);

  // Notification / reminder state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(getNotificationPermission);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(19);
  const [reminderMinute, setReminderMinute] = useState(0);

  useEffect(() => {
    const s = getReminderSettings();
    setReminderEnabled(s.enabled);
    setReminderHour(s.hour);
    setReminderMinute(s.minute);
  }, []);

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
  };

  const saveReminder = (patch: Partial<ReminderSettings>) => {
    const next: ReminderSettings = {
      enabled: reminderEnabled,
      hour: reminderHour,
      minute: reminderMinute,
      ...patch,
    };
    saveReminderSettings(next);
  };

  const handleToggleReminder = (enabled: boolean) => {
    setReminderEnabled(enabled);
    saveReminder({ enabled });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(':').map(Number);
    setReminderHour(h);
    setReminderMinute(m);
    saveReminder({ hour: h, minute: m });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser({ name, goal, daysPerWeek, minutesPerSession, experienceLevel, equipment });
      toast('Perfil actualizado', 'success');
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEquipment = (item: string) => {
    setEquipment(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    );
  };

  const handleExportData = () => {
    const exportData: Record<string, unknown> = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          exportData[key] = JSON.parse(raw);
        } catch {
          exportData[key] = raw;
        }
      }
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitgame-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Datos exportados', 'success');
  };

  const handleExportCSV = () => {
    const headers = ['Fecha', 'Sesion', 'Ejercicio', 'Set', 'Peso (kg)', 'Reps', 'Completado', 'RPE'];
    const rows: string[][] = [headers];

    for (const session of workoutHistory) {
      const date = session.date ? new Date(session.date).toLocaleDateString('es-ES') : '';
      for (const ex of session.exercises) {
        const exerciseName = exerciseBlueprints.find(e => e.id === ex.exerciseId)?.name ?? ex.exerciseId;
        ex.sets.forEach((set, idx) => {
          rows.push([
            date,
            session.name,
            exerciseName,
            String(idx + 1),
            String(set.weight),
            String(set.reps),
            set.completed ? 'Si' : 'No',
            set.rpe != null ? String(set.rpe) : '',
          ]);
        });
      }
    }

    const csv = rows
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitgame-historial-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Historial exportado como CSV', 'success');
  };

  const handleResetPassword = async () => {
    if (!user.email) {
      toast('No hay email configurado', 'warning');
      return;
    }
    const result = await resetPassword(user.email);
    if (result.error) {
      toast(result.error, 'error');
    } else {
      toast('Email de restablecimiento enviado', 'success');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Esta accion es irreversible. Se eliminaran todos tus datos, templates, historial y records. Deseas continuar?'
    );
    if (!confirmed) return;

    const doubleConfirm = confirm('Confirma que deseas eliminar tu cuenta permanentemente.');
    if (!doubleConfirm) return;

    const result = await deleteAccount();
    if (result.error) {
      toast(result.error, 'error');
      return;
    }

    // Clear all local data
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    toast('Cuenta eliminada', 'info');
    // Sign out will trigger auth state change and redirect to login
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
          isLoading={isSaving}
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
          <label htmlFor="settings-name" className="text-sm font-medium text-text-muted block mb-1.5">Nombre</label>
          <input
            id="settings-name"
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
              aria-pressed={goal === g.value}
              className={cn(
                'p-4 rounded-xl border text-left transition-all',
                goal === g.value
                  ? 'border-primary bg-primary/10 text-white'
                  : 'border-gray-700 text-text-muted hover:border-gray-600'
              )}
            >
              <span className="text-xl" aria-hidden="true">{g.icon}</span>
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
                aria-pressed={experienceLevel === l.value}
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

      {/* Theme */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Sun className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Tema</h2>
        </div>
        <div className="flex gap-3">
          {([
            { value: 'dark' as ThemeMode, label: 'Oscuro', icon: <Moon className="w-4 h-4" /> },
            { value: 'light' as ThemeMode, label: 'Claro', icon: <Sun className="w-4 h-4" /> },
            { value: 'system' as ThemeMode, label: 'Sistema', icon: <Monitor className="w-4 h-4" /> },
          ]).map(t => (
            <button
              key={t.value}
              onClick={() => setThemeMode(t.value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all',
                themeMode === t.value
                  ? 'border-primary bg-primary/10 text-white'
                  : 'border-gray-700 text-text-muted hover:border-gray-600'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Notifications Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Notificaciones</h2>
        </div>

        {!('Notification' in window) ? (
          <p className="text-sm text-text-muted">
            Tu navegador no soporta notificaciones.
          </p>
        ) : notifPermission === 'denied' ? (
          <p className="text-sm text-red-400">
            Notificaciones bloqueadas. Activaelas desde los ajustes del navegador.
          </p>
        ) : notifPermission === 'default' ? (
          <button
            onClick={handleRequestPermission}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-primary/50 bg-primary/5 text-primary hover:bg-primary/10 transition-all text-sm font-medium"
          >
            <span>Permitir notificaciones</span>
            <Bell className="w-4 h-4" />
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Recordatorio diario</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Aviso si aun no entrenaste despues de la hora elegida
                </p>
              </div>
              <button
                role="switch"
                aria-checked={reminderEnabled}
                onClick={() => handleToggleReminder(!reminderEnabled)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                  reminderEnabled ? 'bg-primary' : 'bg-gray-700'
                )}
              >
                <span
                  className={cn(
                    'block w-5 h-5 bg-white rounded-full shadow transition-transform',
                    reminderEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            {reminderEnabled && (
              <div>
                <label
                  htmlFor="reminder-time"
                  className="text-sm font-medium text-text-muted block mb-1.5"
                >
                  Hora del recordatorio
                </label>
                <input
                  id="reminder-time"
                  type="time"
                  value={`${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`}
                  onChange={handleTimeChange}
                  className="px-4 py-3 bg-background border border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Data Section */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <Download className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Datos</h2>
        </div>
        <p className="text-sm text-text-muted">Exporta tu perfil, templates, historial y records.</p>
        <button
          onClick={handleExportData}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-gray-700 text-text-muted hover:text-white hover:border-gray-600 transition-all text-sm"
        >
          <span>Exportar backup completo (JSON)</span>
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-gray-700 text-text-muted hover:text-white hover:border-gray-600 transition-all text-sm"
        >
          <span>Exportar historial de entrenos (CSV)</span>
          <FileText className="w-4 h-4" />
        </button>
      </Card>

      {/* Account Section */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">Cuenta</h2>
        </div>
        <p className="text-sm text-text-muted">{user.email || 'Sin email configurado'}</p>
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleResetPassword}
            disabled={!isSupabaseConfigured()}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-gray-700 text-text-muted hover:text-white hover:border-gray-600 transition-all text-sm disabled:opacity-50"
          >
            <span>Cambiar contrasena</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={!isSupabaseConfigured()}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-red-900/30 text-red-400 hover:bg-red-500/5 hover:border-red-800/50 transition-all text-sm disabled:opacity-50"
          >
            <span>Eliminar cuenta</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
