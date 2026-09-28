import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md';
  centered?: boolean;
  error?: boolean;
}

// text-base (16px) es el minimo: Safari en iOS hace zoom al enfocar un campo
// con tipo menor y deja la pantalla desencuadrada.
const sizeStyles: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'py-2 text-base',
  md: 'py-2.5 text-base',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      leftIcon,
      rightIcon,
      size = 'md',
      centered = false,
      error = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full min-h-11 bg-background border rounded-lg text-text-main font-bold transition-all duration-fast',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary',
            sizeStyles[size],
            leftIcon ? 'pl-10' : 'pl-3',
            rightIcon ? 'pr-10' : 'pr-3',
            centered && 'text-center',
            error ? 'border-danger' : 'border-border-input',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
