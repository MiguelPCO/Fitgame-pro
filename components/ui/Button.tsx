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
    'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95',
  secondary:
    'bg-background-card border border-gray-700 hover:bg-gray-800 text-white hover:border-gray-600 active:scale-95',
  ghost:
    'bg-transparent hover:bg-white/10 text-text-muted hover:text-white active:scale-95',
  danger:
    'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 active:scale-95',
  success:
    'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 active:scale-95',
};

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
          'inline-flex items-center justify-center font-bold transition-all',
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
