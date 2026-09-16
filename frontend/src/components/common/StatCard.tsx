import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  iconColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  iconColor = 'text-[#1A73E8] bg-blue-50 border-blue-200',
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-2xl font-black font-heading text-[#0F223D] mt-1.5 tracking-tight">{value}</p>
        </div>
        <div className={cn('p-3 rounded-xl border', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                'font-semibold px-1.5 py-0.5 rounded text-[10px]',
                trend.isPositive ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'
              )}
            >
              {trend.value}
            </span>
          )}
          {subtext && <span className="text-slate-500 text-[11px] truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
