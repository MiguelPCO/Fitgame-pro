import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '../lib/utils';

// -- Date Helpers --
const formatDayName = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

const formatDayNum = (date: Date): number => date.getDate();

const formatMonthYear = (date: Date): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const checkIsToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

const checkIsSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
};

const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekDates = (baseDate: Date): Date[] => {
  const dates: Date[] = [];
  const day = baseDate.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Start from Monday

  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + diff);

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }

  return dates;
};

// -- Types --
interface WorkoutDayStatus {
  date: string; // 'YYYY-MM-DD'
  status: 'completed' | 'pending' | 'rest';
}

interface DateSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  workoutDays?: WorkoutDayStatus[];
}

// -- Component --
const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
  workoutDays = []
}) => {
  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate the base date for the current week view
  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + (weekOffset * 7));

  const weekDates = getWeekDates(baseDate);
  const weekNum = getWeekNumber(weekDates[0]);
  const monthYear = formatMonthYear(weekDates[3]); // Use middle of week for month

  const getStatus = (date: Date): 'completed' | 'pending' | 'rest' | null => {
    const dateStr = formatDateString(date);
    const found = workoutDays.find(wd => wd.date === dateStr);
    return found?.status || null;
  };

  const handlePrevWeek = () => setWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setWeekOffset(prev => prev + 1);
  const handleGoToToday = () => {
    setWeekOffset(0);
    onSelectDate(new Date());
  };

  return (
    <div className="w-full">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleGoToToday}
          className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
        >
          {monthYear} <span className="text-text-muted">· Week {weekNum}</span>
        </button>

        <button
          onClick={handleNextWeek}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekDates.map((date, idx) => {
          const isSelected = checkIsSameDay(date, selectedDate);
          const isTodayVal = checkIsToday(date);
          const status = getStatus(date);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(date)}
              className={cn(
                'flex flex-col items-center justify-center py-2 sm:py-3 px-0.5 sm:px-1 rounded-xl sm:rounded-2xl border transition-all duration-200',
                'min-h-[88px] relative',
                isSelected
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                  : 'bg-background-card border-gray-800 hover:border-gray-600 hover:bg-gray-800/50',
                isTodayVal && !isSelected && 'ring-2 ring-primary/50'
              )}
            >
              {/* Day name */}
              <span className={cn(
                'text-[11px] font-medium uppercase tracking-wide mb-1',
                isSelected ? 'text-white/80' : 'text-text-muted'
              )}>
                {formatDayName(date)}
              </span>

              {/* Day number */}
              <span className={cn(
                'text-xl font-bold',
                isSelected ? 'text-white' : 'text-white'
              )}>
                {formatDayNum(date)}
              </span>

              {/* Status indicator */}
              <div className="mt-2 h-4 flex items-center justify-center">
                {status === 'completed' && (
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center',
                    isSelected ? 'bg-white/20' : 'bg-green-500/20'
                  )}>
                    <Check className={cn(
                      'w-3 h-3',
                      isSelected ? 'text-white' : 'text-green-400'
                    )} />
                  </div>
                )}
                {status === 'pending' && (
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isSelected ? 'bg-white' : 'bg-yellow-500'
                  )} />
                )}
                {status === 'rest' && (
                  <div className={cn(
                    'w-4 h-0.5 rounded-full',
                    isSelected ? 'bg-white/40' : 'bg-gray-600'
                  )} />
                )}
                {!status && isTodayVal && !isSelected && (
                  <span className="text-[10px] font-bold text-primary uppercase">
                    Today
                  </span>
                )}
                {isTodayVal && isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateSelector;
