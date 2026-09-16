import React, { useState } from 'react';
import {
  Calendar,
  Flag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Milestone, ProjectStatus } from '../../types';

interface GanttTimelineProps {
  milestones: Milestone[];
  projectStartDate?: string;
  projectExpectedDate?: string;
  onUpdateMilestone?: (milestone: Milestone) => void;
  canEdit?: boolean;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({
  milestones,
  projectStartDate,
  projectExpectedDate,
  onUpdateMilestone,
  canEdit = false,
}) => {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
        No milestones defined for this project timeline yet.
      </div>
    );
  }

  // Sort milestones by date
  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.expectedCompletionDate).getTime() - new Date(b.expectedCompletionDate).getTime()
  );

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500 text-white';
      case 'IN_PROGRESS':
        return 'bg-blue-600 text-white';
      case 'DELAYED':
        return 'bg-rose-500 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  const getBarColor = (status: ProjectStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'from-emerald-500 to-teal-500';
      case 'IN_PROGRESS':
        return 'from-blue-600 to-cyan-500';
      case 'DELAYED':
        return 'from-rose-500 to-amber-500';
      default:
        return 'from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Flag className="w-4 h-4 text-blue-600" /> Milestone Execution & Gantt Timeline
          </h3>
          <p className="text-xs text-slate-500">
            Interactive schedule tracking showing milestone targets, progress burn, and completion status.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-bold">
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
          </span>
          <span className="flex items-center gap-1 text-blue-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> In Progress
          </span>
          <span className="flex items-center gap-1 text-rose-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Delayed
          </span>
        </div>
      </div>

      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {sortedMilestones.map((m, index) => {
          const isOverdue =
            m.status !== 'COMPLETED' && new Date(m.expectedCompletionDate).getTime() < Date.now();

          return (
            <div
              key={m.id || index}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${getStatusColor(
                      m.status
                    )}`}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{m.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Responsible: <strong>{m.responsiblePerson}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0">
                  <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Due: {new Date(m.expectedCompletionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>

                  {isOverdue && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Overdue
                    </span>
                  )}

                  <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs">
                    {m.progressPercentage}%
                  </span>

                  {canEdit && onUpdateMilestone && (
                    <button
                      onClick={() => onUpdateMilestone(m)}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Update
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Gantt Bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden shadow-inner">
                <div
                  className={`h-full bg-gradient-to-r ${getBarColor(
                    m.status
                  )} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.max(5, m.progressPercentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
