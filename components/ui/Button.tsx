import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary hover:bg-primary-hover text-primary-ink shadow-glow-primary hover:scale-105 active:scale-95',
  secondary:
    'bg-background-card border border-divider hover:bg-surface-raised text-text-main hover:border-border-input active:scale-95',
  ghost:
    'bg-transparent hover:bg-text-main/10 text-text-muted hover:text-text-main active:scale-95',
  danger:
    'bg-danger-fill hover:bg-danger text-danger-ink shadow-raised active:scale-95',
  success:
    'bg-success-fill hover:bg-success text-success-ink shadow-raised active:scale-95',
};

// min-h-11 = 44px: objetivo tactil minimo, aunque el texto sea pequeno.
const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={cn(
          'inline-flex items-center justify-center min-h-11 font-bold transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed hover:scale-100',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
