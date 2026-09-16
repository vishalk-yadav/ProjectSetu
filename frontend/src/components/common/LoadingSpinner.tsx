import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading telemetry & records...',
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <Loader2 className="w-8 h-8 animate-spin text-[#1A73E8] mb-3" />
      <p className="text-xs font-semibold text-slate-600">{message}</p>
    </div>
  );
};
