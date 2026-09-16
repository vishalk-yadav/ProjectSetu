import React from 'react';
import { FolderOpen } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200/80 rounded-2xl shadow-2xs',
        className
      )}
    >
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 mb-4">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h4 className="text-base font-bold text-[#0F223D] font-heading">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white shadow-xs transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
