import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WorkoutDayCard } from './WorkoutDayCard';
import { WorkoutSession } from '../../types';

const mockWorkout: WorkoutSession = {
  id: 'test-1',
  name: 'Push Day',
  duration: '60 min',
  muscleFocus: ['Chest', 'Shoulders'],
  completed: false,
  xpReward: 50,
  exercises: [],
  status: 'pending',
};

describe('WorkoutDayCard', () => {
  it('renders rest day card when no workout', () => {
    render(<WorkoutDayCard date={new Date()} variant="today" />);
    expect(screen.getByText('Rest Day')).toBeInTheDocument();
  });

  it('renders workout name when workout provided', () => {
    render(<WorkoutDayCard workout={mockWorkout} date={new Date()} variant="today" />);
    expect(screen.getByText('Push Day')).toBeInTheDocument();
  });

  it('shows "Scheduled for Today" badge on today variant', () => {
    render(<WorkoutDayCard workout={mockWorkout} date={new Date()} variant="today" />);
    expect(screen.getByText('Scheduled for Today')).toBeInTheDocument();
  });

  it('shows "Completed" badge on past variant', () => {
    render(<WorkoutDayCard workout={mockWorkout} date={new Date()} variant="past" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows "Upcoming" badge on future variant', () => {
    render(<WorkoutDayCard workout={mockWorkout} date={new Date()} variant="future" />);
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('shows start button only on today with workout and handler', () => {
    const onStart = vi.fn();
    render(<WorkoutDayCard workout={mockWorkout} date={new Date()} variant="today" onStartWorkout={onStart} />);
    const btn = screen.getByText(/Start Session/i);
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('does not show start button on future variant', () => {
    render(<WorkoutDayCard workout={mockWorkout} date={new Date()} variant="future" onStartWorkout={vi.fn()} />);
    expect(screen.queryByText(/Start Session/i)).not.toBeInTheDocument();
  });

  it('displays duration info', () => {
    render(<WorkoutDayCard workout={mockWorkout} date={new Date()} variant="today" />);
    expect(screen.getByText('60 min')).toBeInTheDocument();
  });
});
