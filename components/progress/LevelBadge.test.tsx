import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LevelBadge } from './LevelBadge';

describe('LevelBadge', () => {
  it('renders level number', () => {
    render(<LevelBadge level={15} levelName="Intermediate" />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders level name', () => {
    render(<LevelBadge level={5} levelName="Novice" />);
    expect(screen.getByText('Novice')).toBeInTheDocument();
  });

  it('applies gray colors for level 0-9', () => {
    const { container } = render(<LevelBadge level={5} levelName="Novice" />);
    expect(container.innerHTML).toContain('from-slate-400');
  });

  it('applies green colors for level 10-19', () => {
    const { container } = render(<LevelBadge level={12} levelName="Intermediate" />);
    expect(container.innerHTML).toContain('from-emerald-400');
  });

  it('applies blue colors for level 20-29', () => {
    const { container } = render(<LevelBadge level={25} levelName="Advanced" />);
    expect(container.innerHTML).toContain('from-cyan-400');
  });

  it('applies purple colors for level 30-49', () => {
    const { container } = render(<LevelBadge level={35} levelName="Advanced" />);
    expect(container.innerHTML).toContain('from-purple-500');
  });

  it('applies gold colors for level 50+', () => {
    const { container } = render(<LevelBadge level={55} levelName="Elite" />);
    expect(container.innerHTML).toContain('from-amber-400');
  });

  it('applies small size classes', () => {
    const { container } = render(<LevelBadge level={1} levelName="Novice" size="sm" />);
    expect(container.innerHTML).toContain('w-12');
  });

  it('applies large size classes', () => {
    const { container } = render(<LevelBadge level={1} levelName="Novice" size="lg" />);
    expect(container.innerHTML).toContain('w-24');
  });
});
