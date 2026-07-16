import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  className?: string;
  fontFamily?: 'sans' | 'mono';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  icon,
  className = '',
  fontFamily = 'sans',
  ...props
}, ref) => {
  const fontClass = fontFamily === 'mono' ? 'font-mono' : 'font-sans';
  
  return (
    <div className="flex flex-col gap-1.5 w-full group">
      {label && (
        <label className="font-sans font-bold text-[11px] tracking-wider uppercase text-on-surface-variant group-focus-within:text-primary transition-colors duration-200">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full bg-[#131318] border border-[#24242D] rounded-lg overflow-hidden transition-all duration-200 group-focus-within:border-primary group-focus-within:shadow-[0_0_12px_rgba(173,198,255,0.15)]">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 text-[#8c909f] group-focus-within:text-primary transition-colors duration-200 text-[20px] select-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full bg-transparent border-none text-[#e0e3e5] placeholder-[#8c909f]/60 py-2.5 px-3 focus:outline-none focus:ring-0 text-sm ${
            icon ? 'pl-10' : ''
          } ${fontClass} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
});

Input.displayName = 'Input';
