import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  className = '',
  showLabel = false,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>{value} XP</span>
          <span>{max} XP</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};