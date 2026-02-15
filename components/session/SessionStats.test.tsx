import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SessionStats } from './SessionStats';

describe('SessionStats', () => {
  it('renders 4 stat cards', () => {
    const { container } = render(
      <SessionStats duration={3600} totalVolume={5000} setsCompleted={12} averageRPE={8.5} />
    );
    const cards = container.querySelectorAll('.rounded-xl');
    expect(cards.length).toBe(4);
  });

  it('displays volume in kg', () => {
    render(<SessionStats duration={0} totalVolume={2500} setsCompleted={0} averageRPE={0} />);
    expect(screen.getByText(/2.*500 kg/)).toBeInTheDocument();
  });

  it('displays sets completed', () => {
    render(<SessionStats duration={0} totalVolume={0} setsCompleted={15} averageRPE={0} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('displays RPE with 1 decimal', () => {
    render(<SessionStats duration={0} totalVolume={0} setsCompleted={0} averageRPE={8.5} />);
    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('displays dash for RPE 0', () => {
    render(<SessionStats duration={0} totalVolume={0} setsCompleted={0} averageRPE={0} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('displays stat labels', () => {
    render(<SessionStats duration={0} totalVolume={0} setsCompleted={0} averageRPE={0} />);
    expect(screen.getByText('Duración')).toBeInTheDocument();
    expect(screen.getByText('Volumen')).toBeInTheDocument();
    expect(screen.getByText('Series')).toBeInTheDocument();
    expect(screen.getByText('RPE Prom.')).toBeInTheDocument();
  });
});
