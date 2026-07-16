import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverGlow?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  hoverGlow = true, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`bg-[#101415] border border-[#24242D] rounded-[16px] p-6 transition-all duration-300 relative overflow-hidden ${
        hoverGlow 
          ? 'hover:border-primary/45 hover:shadow-[0_0_24px_rgba(81,142,250,0.06)]' 
          : ''
      } ${className}`}
      {...props}
    >
      {/* Subtle background radial glow */}
      {hoverGlow && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100"></div>
      )}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
