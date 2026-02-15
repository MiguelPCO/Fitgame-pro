import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge, getDifficultyVariant } from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies primary variant styles', () => {
    render(<Badge variant="primary" data-testid="badge">Tag</Badge>);
    expect(screen.getByTestId('badge').className).toContain('text-primary');
  });

  it('applies success variant styles', () => {
    render(<Badge variant="success" data-testid="badge">OK</Badge>);
    expect(screen.getByTestId('badge').className).toContain('text-green');
  });

  it('applies warning variant styles', () => {
    render(<Badge variant="warning" data-testid="badge">Warn</Badge>);
    expect(screen.getByTestId('badge').className).toContain('yellow');
  });

  it('applies size sm', () => {
    render(<Badge size="sm" data-testid="badge">Small</Badge>);
    expect(screen.getByTestId('badge').className).toContain('text-[10px]');
  });
});

describe('getDifficultyVariant', () => {
  it('returns success for Beginner', () => {
    expect(getDifficultyVariant('Beginner')).toBe('success');
  });

  it('returns warning for Intermediate', () => {
    expect(getDifficultyVariant('Intermediate')).toBe('warning');
  });

  it('returns danger for Advanced', () => {
    expect(getDifficultyVariant('Advanced')).toBe('danger');
  });
});
