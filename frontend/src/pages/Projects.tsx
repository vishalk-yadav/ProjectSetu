import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  MapPin,
  Calendar,
  Building2,
  TrendingUp,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { projectApi, ProjectQueryParams } from '../api/projectApi';
import { departmentApi } from '../api/departmentApi';
import { Project, Department } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { UpdateProgressModal } from '../components/projects/UpdateProgressModal';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrencyINR,
  formatDate,
  getRiskBadgeClasses,
  getStatusBadgeClasses,
  getPriorityBadgeClasses,
} from '../utils/formatters';

export const Projects: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canSanctionProjects } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter states
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [priority, setPriority] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [progressModalProject, setProgressModalProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params: ProjectQueryParams = {
        search: search || undefined,
        departmentId: departmentId || undefined,
        status: status || undefined,
        riskLevel: riskLevel || undefined,
        priority: priority || undefined,
        sortBy,
        sortOrder,
      };
      const res = await projectApi.listProjects(params);
      setProjects(res.data || []);
    } catch (e) {
      console.error('Failed to fetch projects', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    departmentApi.listDepartments().then(setDepartments);
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProjects, 200);
    return () => clearTimeout(timer);
  }, [search, departmentId, status, riskLevel, priority, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F223D] font-heading tracking-tight">
            {t('projects.title')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('projects.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#1A73E8] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#1A73E8] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {canSanctionProjects ? (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('projects.sanctionProject')}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-bold shadow-2xs">
              <FolderKanban className="w-4 h-4 text-slate-500" />
              <span>{t('projects.executionMode', 'Project Execution Mode')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('projects.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">{t('projects.allMinistries')}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name.substring(0, 25)}...
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">{t('projects.allStatuses')}</option>
              <option value="IN_PROGRESS">{t('common.inProgress')}</option>
              <option value="COMPLETED">{t('common.completed')}</option>
              <option value="DELAYED">{t('common.delayed')}</option>
              <option value="NOT_STARTED">{t('common.notStarted')}</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">{t('projects.allRiskLevels')}</option>
              <option value="LOW">{t('common.low')} (0-30)</option>
              <option value="MODERATE">{t('common.medium')} (31-60)</option>
              <option value="HIGH">{t('common.high')} (61-80)</option>
              <option value="CRITICAL">{t('common.critical')} (81-100)</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">{t('projects.allPriorities')}</option>
              <option value="CRITICAL">{t('common.critical')}</option>
              <option value="HIGH">{t('common.high')}</option>
              <option value="MEDIUM">{t('common.medium')}</option>
              <option value="LOW">{t('common.low')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner message={t('common.loading')} />
      ) : projects.length === 0 ? (
        <EmptyState
          title={t('projects.noProjects')}
          description={t('projects.noProjectsDesc')}
          actionLabel={t('projects.clearFilters')}
          onAction={() => {
            setSearch('');
            setDepartmentId('');
            setStatus('');
            setRiskLevel('');
            setPriority('');
          }}
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const budgetPct = p.allocatedBudget > 0 ? (p.utilizedBudget / p.allocatedBudget) * 100 : 0;
            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-blue-50 text-[#1A73E8] border border-blue-200 uppercase">
                        {p.department?.code || 'DEPT'}
                      </span>
                      {p.projectCode && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {p.projectCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getPriorityBadgeClasses(p.priority)}`}>
                        {p.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClasses(p.status)}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="text-sm font-bold text-[#0F223D] font-heading cursor-pointer group-hover:text-[#1A73E8] transition-colors line-clamp-2"
                  >
                    {p.name}
                  </h3>
                  {p.implementingAgency && (
                    <p className="text-[11px] font-semibold text-blue-700 mt-0.5 line-clamp-1">
                      {p.implementingAgency}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Meta details */}
                  <div className="mt-3 space-y-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Deadline: {formatDate(p.expectedCompletionDate)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Physical Progress</span>
                      <span className="font-extrabold text-[#0F223D]">{p.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#1A73E8] h-full rounded-full transition-all duration-500"
                        style={{ width: `${p.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget & Risk Indicators */}
                  <div className="mt-4 grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">{t('dashboard.kpi.sanctionedOutlay')}</p>
                      <p className="font-bold text-[#0F223D] mt-0.5">{formatCurrencyINR(p.allocatedBudget)}</p>
                      <span className="text-[10px] text-slate-500">{budgetPct.toFixed(0)}% {t('dashboard.kpi.utilized')}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">{t('projects.riskScore')}</p>
                      <div className="mt-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getRiskBadgeClasses(p.riskScore)}`}>
                          {p.riskScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setProgressModalProject(p)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {t('projects.update')}
                  </button>
                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{t('projects.inspect')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">{t('projects.projectName')}</th>
                  <th className="py-3.5 px-3">{t('projects.ministry')}</th>
                  <th className="py-3.5 px-3">{t('common.status', 'Status')}</th>
                  <th className="py-3.5 px-3">{t('projects.priority')}</th>
                  <th className="py-3.5 px-3">{t('projects.progress')}</th>
                  <th className="py-3.5 px-3">{t('projects.budget')}</th>
                  <th className="py-3.5 px-3">{t('projects.riskScore')}</th>
                  <th className="py-3.5 px-3">{t('projects.deadline')}</th>
                  <th className="py-3.5 px-4 text-right">{t('projects.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => navigate(`/projects/${p.id}`)}
                            className="hover:text-[#1A73E8] cursor-pointer truncate max-w-xs font-bold"
                          >
                            {p.name}
                          </span>
                          {p.projectCode && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                              {p.projectCode}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {p.implementingAgency ? `${p.implementingAgency} • ` : ''}{p.location}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-700">{p.department?.code}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClasses(p.status)}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getPriorityBadgeClasses(p.priority)}`}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="w-24">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="font-bold text-slate-800">{p.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#1A73E8] h-full rounded-full"
                            style={{ width: `${p.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-[#0F223D]">{formatCurrencyINR(p.allocatedBudget)}</p>
                      <span className="text-[10px] text-slate-400 block">
                        {formatCurrencyINR(p.utilizedBudget)} {t('dashboard.charts.spentBadge').toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getRiskBadgeClasses(p.riskScore)}`}>
                        {p.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-medium">
                      {formatDate(p.expectedCompletionDate)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setProgressModalProject(p)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {t('projects.update')}
                      </button>
                      <button
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        {t('projects.inspect')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchProjects}
      />

      {/* Update Progress Modal */}
      {progressModalProject && (
        <UpdateProgressModal
          isOpen={!!progressModalProject}
          onClose={() => setProgressModalProject(null)}
          project={progressModalProject}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
};
