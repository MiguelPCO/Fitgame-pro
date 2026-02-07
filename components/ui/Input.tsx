import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md';
  centered?: boolean;
  error?: boolean;
}

const sizeStyles: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'py-1.5 text-sm',
  md: 'py-2 text-sm',
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
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-background border rounded-lg text-white font-bold transition-all',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
            sizeStyles[size],
            leftIcon ? 'pl-10' : 'pl-3',
            rightIcon ? 'pr-10' : 'pr-3',
            centered && 'text-center',
            error ? 'border-red-500' : 'border-gray-700',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
