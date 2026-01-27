import { InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-sm border border-[#111] bg-[#f9f9f7] px-4 py-3 text-base text-[#111] placeholder:text-[#111]/50 focus:outline-none focus:ring-2 focus:ring-[#111] focus:border-transparent transition-all ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
