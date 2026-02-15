import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies bg-background-card class', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card').className).toContain('bg-background-card');
  });

  it('applies border by default', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card').className).toContain('border');
  });

  it('removes border when border=false', () => {
    render(<Card data-testid="card" border={false}>Content</Card>);
    expect(screen.getByTestId('card').className).not.toContain('border-gray-700');
  });

  it('applies hover classes when hover=true', () => {
    render(<Card data-testid="card" hover>Content</Card>);
    expect(screen.getByTestId('card').className).toContain('hover:border-gray-600');
  });

  it('applies padding variants', () => {
    const { rerender } = render(<Card data-testid="card" padding="none">Content</Card>);
    expect(screen.getByTestId('card').className).not.toContain('p-4');

    rerender(<Card data-testid="card" padding="lg">Content</Card>);
    expect(screen.getByTestId('card').className).toContain('p-6');
  });

  it('merges custom className', () => {
    render(<Card data-testid="card" className="my-custom">Content</Card>);
    expect(screen.getByTestId('card').className).toContain('my-custom');
  });
});
