import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-sm px-6 py-3 text-base font-light transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#111] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed button-press';
    
    const variants = {
      primary:
        'bg-[#111] text-[#f9f9f7] hover:opacity-90 focus:ring-[#111]',
      secondary:
        'bg-[#f9f9f7] text-[#111] border border-[#111] hover:bg-[#111] hover:text-[#f9f9f7] focus:ring-[#111]',
      outline:
        'border border-[#111] text-[#111] bg-transparent hover:bg-[#111] hover:text-[#f9f9f7] focus:ring-[#111]',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
