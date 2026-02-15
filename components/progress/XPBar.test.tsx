import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { XPBar } from './XPBar';

describe('XPBar', () => {
  it('renders current XP label', () => {
    render(<XPBar currentXP={150} xpToNext={500} level={3} />);
    expect(screen.getByText(/150/)).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('shows XP remaining to next level', () => {
    render(<XPBar currentXP={200} xpToNext={500} level={5} />);
    expect(screen.getByText(/300/)).toBeInTheDocument();
    expect(screen.getByText(/Level 6/)).toBeInTheDocument();
  });

  it('hides labels when showLabel is false', () => {
    render(<XPBar currentXP={200} xpToNext={500} level={5} showLabel={false} />);
    expect(screen.queryByText(/Level 6/)).not.toBeInTheDocument();
  });

  it('calculates progress width correctly', () => {
    const { container } = render(<XPBar currentXP={250} xpToNext={500} level={1} />);
    const progressBars = container.querySelectorAll('[style*="width: 50%"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('caps progress at 100%', () => {
    const { container } = render(<XPBar currentXP={600} xpToNext={500} level={1} />);
    const progressBars = container.querySelectorAll('[style*="width: 100%"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('renders level markers', () => {
    const { container } = render(<XPBar currentXP={0} xpToNext={100} level={1} />);
    // 4 level marker dividers
    const markers = container.querySelectorAll('.bg-gray-700\\/50');
    expect(markers.length).toBe(4);
  });
});
