import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, AlertTriangle, ExternalLink, Filter } from 'lucide-react';
import { projectApi } from '../api/projectApi';
import { Project, Milestone } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

export const MilestonesPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OVERDUE' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await projectApi.listProjects({ limit: 50 });
      setProjects(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Consolidating milestone schedules across all active projects..." />;
  }

  // Extract all milestones with parent project info
  const allMilestones: Array<Milestone & { project: Project }> = [];
  const now = new Date();

  projects.forEach((p) => {
    if (p.milestones) {
      p.milestones.forEach((m) => {
        const isOverdue = m.status !== 'COMPLETED' && new Date(m.expectedCompletionDate) < now;
        allMilestones.push({
          ...m,
          isOverdue,
          project: p,
        });
      });
    }
  });

  const filtered = allMilestones.filter((m) => {
    if (statusFilter === 'OVERDUE') return m.isOverdue;
    if (statusFilter === 'IN_PROGRESS') return m.status === 'IN_PROGRESS' && !m.isOverdue;
    if (statusFilter === 'COMPLETED') return m.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F223D] font-heading tracking-tight">
            Cross-Project Milestones Surveillance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Stage-gate deliverables, overdue bottlenecks, and completion verification across India.
          </p>
        </div>

        <div className="flex border border-slate-200 rounded-xl p-1 bg-white shadow-2xs">
          {(['ALL', 'OVERDUE', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === s ? 'bg-[#1A73E8] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No milestones found for the selected filter.
            </div>
          ) : (
            filtered.map((m) => (
              <div
                key={m.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 uppercase">
                      {m.project.department?.code}
                    </span>
                    <h4 className="text-xs font-bold text-[#0F223D]">{m.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      m.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                        : m.isOverdue
                        ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                        : 'bg-blue-50 text-blue-700 border-blue-200/60'
                    }`}>
                      {m.status === 'COMPLETED' ? 'COMPLETED' : m.isOverdue ? 'OVERDUE' : m.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Project:{' '}
                    <span
                      onClick={() => navigate(`/projects/${m.projectId}`)}
                      className="text-[#1A73E8] font-semibold hover:underline cursor-pointer"
                    >
                      {m.project.name}
                    </span>
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-2">
                    <span>Deadline: <strong className="text-slate-700 font-semibold">{formatDate(m.expectedCompletionDate)}</strong></span>
                    <span>Officer: <strong className="text-slate-700 font-medium">{m.responsiblePerson}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="w-28 text-right">
                    <span className="text-xs font-black text-[#0F223D]">{m.progressPercentage}%</span>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-[#1A73E8] h-full rounded-full" style={{ width: `${m.progressPercentage}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/projects/${m.projectId}`)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#1A73E8] border border-slate-200/60 transition-colors"
                    title="View Project"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
