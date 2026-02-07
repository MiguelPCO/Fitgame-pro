import React from 'react';
import { Play, Zap, Clock, Flame, TrendingUp, Dumbbell, Check, Calendar } from 'lucide-react';
import { WorkoutSession } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

type CardVariant = 'future' | 'today' | 'past';

interface WorkoutDayCardProps {
  workout?: WorkoutSession;
  date: Date;
  variant: CardVariant;
  onStartWorkout?: () => void;
}

interface BadgeConfig {
  label: string;
  icon: React.ReactNode;
  className: string;
}

function getBadgeConfig(variant: CardVariant, hasWorkout: boolean): BadgeConfig {
  if (!hasWorkout) {
    return {
      label: variant === 'past' ? 'Rest Day' : 'Scheduled Rest',
      icon: <Zap className="w-3 h-3" />,
      className: 'bg-gray-800/50 text-gray-400',
    };
  }

  switch (variant) {
    case 'today':
      return {
        label: 'Scheduled for Today',
        icon: <Zap className="w-3 h-3" />,
        className: 'bg-black/50 text-primary',
      };
    case 'past':
      return {
        label: 'Completed',
        icon: <Check className="w-3 h-3" />,
        className: 'bg-green-500/20 text-green-400',
      };
    case 'future':
      return {
        label: 'Upcoming',
        icon: <Calendar className="w-3 h-3" />,
        className: 'bg-blue-500/20 text-blue-400',
      };
  }
}

export function WorkoutDayCard({ workout, date, variant, onStartWorkout }: WorkoutDayCardProps) {
  const hasWorkout = Boolean(workout);
  const badge = getBadgeConfig(variant, hasWorkout);
  const isActionable = variant === 'today' && hasWorkout && onStartWorkout;

  // Rest day card
  if (!hasWorkout) {
    return (
      <div className={cn(
        'rounded-3xl bg-background-card border border-gray-800 p-8',
        'flex flex-col items-center justify-center text-center min-h-[300px]',
        variant === 'past' ? 'opacity-60' : 'border-dashed'
      )}>
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-500">
          <Zap className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Rest Day</h3>
        <p className="text-text-muted max-w-sm">
          Recovery is where the growth happens. Take it easy or do some light active recovery.
        </p>
        <div className="mt-6 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700 text-sm font-medium text-gray-300">
          +5 XP for resting
        </div>
      </div>
    );
  }

  // Workout card with variant styling
  return (
    <div className={cn(
      'relative overflow-hidden rounded-3xl bg-background-card border border-gray-800 group',
      variant === 'past' && 'opacity-75'
    )}>
      {/* Background Image - only for today */}
      {variant === 'today' && (
        <>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </>
      )}

      <div className={cn(
        'relative z-10 p-6 md:p-8 flex flex-col h-full min-h-[300px] justify-end',
        variant !== 'today' && 'min-h-[250px]'
      )}>
        {/* Badge */}
        <div className="mb-auto">
          <span className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
            'backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider',
            badge.className
          )}>
            {badge.icon} {badge.label}
          </span>
        </div>

        {/* Workout Info */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-text-muted text-sm font-medium mb-1">
              <Dumbbell className="w-4 h-4" /> Strength Training
            </div>
            <h3 className={cn(
              'font-black text-white leading-tight',
              variant === 'today' ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'
            )}>
              {workout.name}
            </h3>
          </div>

          <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" /> {workout.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-primary" /> High Intensity
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" /> +{workout.xpReward} XP
            </span>
          </div>

          {/* Action Button - only for today */}
          {isActionable && (
            <div className="pt-4">
              <Button
                onClick={onStartWorkout}
                size="lg"
                leftIcon={<Play className="w-5 h-5 fill-current" />}
                className="w-full md:w-auto"
              >
                Start Session
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
