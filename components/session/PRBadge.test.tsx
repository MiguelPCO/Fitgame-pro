import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PRBadge } from './PRBadge';

describe('PRBadge', () => {
  it('renders exercise name', () => {
    render(<PRBadge exercise="Bench Press" weight={100} reps={5} />);
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });

  it('renders weight and reps', () => {
    render(<PRBadge exercise="Squat" weight={120} reps={3} />);
    expect(screen.getByText('120kg × 3 reps')).toBeInTheDocument();
  });

  it('renders improvement badge when provided', () => {
    render(<PRBadge exercise="Deadlift" weight={200} reps={1} improvement="+10kg" />);
    expect(screen.getByText('+10kg')).toBeInTheDocument();
  });

  it('does not render improvement when not provided', () => {
    render(<PRBadge exercise="OHP" weight={60} reps={8} />);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });
});
