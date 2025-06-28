import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  variant?: 'default' | 'dark' | 'cyan' | 'purple' | 'green';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  glass = false,
  variant = 'default'
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300';
  
  let variantClasses = '';
  
  if (glass) {
    switch (variant) {
      case 'dark':
        variantClasses = 'bg-[#060a14]/95 backdrop-blur-md border-2 border-white/10';
        break;
      case 'cyan':
        variantClasses = 'bg-[#060a14]/95 backdrop-blur-md border-2 border-cyan-400/20';
        break;
      case 'purple':
        variantClasses = 'bg-[#060a14]/95 backdrop-blur-md border-2 border-purple-400/20';
        break;
      case 'green':
        variantClasses = 'bg-[#060a14]/95 backdrop-blur-md border-2 border-green-400/20';
        break;
      default:
        variantClasses = 'bg-white/5 backdrop-blur-md border border-white/10';
    }
  } else {
    variantClasses = 'bg-white shadow-lg';
  }
  
  const hoverClasses = hover 
    ? 'hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 cursor-pointer' 
    : '';

  return (
    <div className={`${baseClasses} ${variantClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};