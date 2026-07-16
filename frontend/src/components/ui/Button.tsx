import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyle = "font-sans font-bold uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer shrink-0";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#adc6ff] to-[#d0bcff] text-[#002e69] hover:brightness-110 shadow-[0_0_15px_rgba(173,198,255,0.15)]",
    secondary: "bg-[#191c1e] border border-[#424753] text-[#e0e3e5] hover:bg-[#272a2c] hover:border-[#adc6ff]/50",
    danger: "bg-[#93000a]/30 border border-[#ffb4ab]/30 text-[#ffb4ab] hover:bg-[#93000a]/50 hover:border-[#ffb4ab]/50",
    ghost: "bg-transparent text-[#8c909f] hover:text-[#e0e3e5] hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[11px] h-8",
    md: "px-4 py-2 text-xs h-10",
    lg: "px-6 py-3 text-sm h-12",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
