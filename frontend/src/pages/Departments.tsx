import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Trophy,
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { departmentApi } from '../api/departmentApi';
import { Department } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { formatCurrencyINR, getRiskBadgeClasses } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export const Departments: React.FC = () => {
  const { t } = useTranslation();
  const { canManageDepartments } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [newDept, setNewDept] = useState({
    name: '',
    code: '',
    departmentHead: '',
    contactInformation: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, ranked] = await Promise.all([
        departmentApi.listDepartments(),
        departmentApi.getDepartmentRankings(),
      ]);
      setDepartments(list);
      setRankings(ranked);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) return;
    try {
      await departmentApi.createDepartment(newDept);
      setCreateModalOpen(false);
      setNewDept({ name: '', code: '', departmentHead: '', contactInformation: '' });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating departmental performance indices..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F223D] font-heading tracking-tight">
            {t('departments.title', 'Ministries & Departments')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('departments.subtitle', 'Departmental performance benchmarking, completion velocity & risk index.')}
          </p>
        </div>

        {canManageDepartments && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('departments.addDepartment', 'Add Department')}</span>
          </button>
        )}
      </div>

      {/* Department Performance Ranking Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F223D] font-heading">
              {t('departments.performanceIndex', 'Department Performance Ranking')}
            </h3>
            <p className="text-[11px] text-slate-500">
              {t('departments.subtitle', 'Evaluated on Milestone Completion (35%), Progress Velocity (35%), Risk Mitigation (20%), and Delay Resilience (10%).')}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3 px-3">{t('departments.rank', 'Rank')}</th>
                <th className="py-3 px-4">{t('departments.deptName', 'Ministry / Department')}</th>
                <th className="py-3 px-3">{t('departments.deptCode', 'Code')}</th>
                <th className="py-3 px-3">{t('dashboard.charts.projectsUnit', 'Projects')}</th>
                <th className="py-3 px-3">{t('departments.physicalProgress', 'Avg Progress')}</th>
                <th className="py-3 px-3">{t('departments.performanceIndex', 'Completion Rate')}</th>
                <th className="py-3 px-3">{t('dashboard.kpi.delayed', 'Delayed')}</th>
                <th className="py-3 px-3">{t('departments.riskRating', 'Avg Risk')}</th>
                <th className="py-3 px-4 text-right">{t('departments.performanceIndex', 'Performance Score')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {rankings.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                        d.rank === 1
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs'
                          : d.rank === 2
                          ? 'bg-slate-200 text-slate-800 border border-slate-300'
                          : d.rank === 3
                          ? 'bg-amber-800 text-amber-50 border border-amber-900'
                          : 'bg-slate-100 text-slate-600 font-bold border border-slate-200'
                      }`}
                    >
                      {d.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#0F223D]">
                    <div>{d.name}</div>
                    <span className="text-[10px] text-slate-500 font-normal">{d.departmentHead}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 text-[11px]">
                      {d.code}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{d.stats.totalProjects}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-700">{d.stats.avgProgress}%</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{d.stats.completionRate}%</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      d.stats.delayedProjects > 0 ? 'bg-rose-50 text-rose-700 border-rose-200/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                    }`}>
                      {d.stats.delayedProjects}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadgeClasses(d.stats.avgRiskScore)}`}>
                      {d.stats.avgRiskScore}/100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-baseline gap-1">
                      <span className="text-base font-black text-amber-600 font-heading">{d.performanceScore}</span>
                      <span className="text-[10px] text-slate-400">/ 100</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((d) => (
          <div key={d.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-200/60">
                  {d.code}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {d.totalUsers || 0} {t('auditLogs.user', 'Officers Registered')}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0F223D] font-heading mt-1">{d.name}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{d.departmentHead}</p>
              <p className="text-[10px] text-slate-400 mt-1 truncate">{d.contactInformation}</p>

              {d.stats && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{t('dashboard.kpi.totalProjects', 'Total Projects')}</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{d.stats.totalProjects}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{t('dashboard.kpi.underExecution', 'Active Execution')}</span>
                    <p className="font-bold text-blue-600 text-sm mt-0.5">{d.stats.activeProjects}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{t('dashboard.kpi.totalOutlay', 'Total Outlay')}</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{formatCurrencyINR(d.stats.totalAllocatedBudget)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{t('departments.physicalProgress', 'Avg Progress')}</span>
                    <p className="font-bold text-emerald-600 text-xs mt-0.5">{d.stats.avgProgress}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal (Only for Super Admin) */}
      {canManageDepartments && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title={t('departments.createModalTitle', 'Register Central Department')}
          subtitle={t('departments.createModalSubtitle', 'Establish nodal administrative organization within ProjectSetu')}
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('departments.deptName', 'Department / Ministry Name')} *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ministry of Railways"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('departments.deptCode', 'Official Department Code')} *</label>
              <input
                type="text"
                required
                placeholder="e.g. MOR"
                value={newDept.code}
                onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('departments.deptHead', 'Nodal Officer / Department Head')}</label>
              <input
                type="text"
                placeholder="e.g. Shri Rajesh Kumar, Secretary"
                value={newDept.departmentHead}
                onChange={(e) => setNewDept({ ...newDept, departmentHead: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('departments.contactInfo', 'Contact Details & Nodal Office')}</label>
              <input
                type="text"
                placeholder="e.g. rail-sec@nic.in | Rail Bhawan, New Delhi"
                value={newDept.contactInformation}
                onChange={(e) => setNewDept({ ...newDept, contactInformation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs cursor-pointer">{t('common.cancel', 'Cancel')}</button>
              <button type="submit" className="px-5 py-2.5 bg-[#1A73E8] hover:bg-blue-600 rounded-xl text-white font-bold text-xs shadow-xs transition-all cursor-pointer">{t('departments.addDepartment', 'Register Department')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
