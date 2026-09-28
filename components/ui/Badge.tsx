import React from 'react';
import { cn } from '../../lib/utils';
import { Difficulty } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  primary: 'bg-primary/10 text-primary border-primary/30',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  info: 'bg-info/10 text-info border-info/30',
  neutral: 'bg-surface-raised text-text-secondary border-divider',
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-2xs',
  md: 'px-3 py-1 text-xs',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', size = 'sm', children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-bold uppercase tracking-wider rounded border',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * Helper function to get badge variant from difficulty level
 */
export function getDifficultyVariant(difficulty: Difficulty): BadgeProps['variant'] {
  switch (difficulty) {
    case 'Beginner':
      return 'success';
    case 'Intermediate':
      return 'warning';
    case 'Advanced':
      return 'danger';
    default:
      return 'neutral';
  }
}

export default Badge;
