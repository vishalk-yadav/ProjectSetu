import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Coins,
  Receipt,
  AlertTriangle,
  Building2,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { budgetApi } from '../api/budgetApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrencyINR, formatDate } from '../utils/formatters';

export const BudgetMonitoring: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    budgetApi.getPortfolioSummary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <LoadingSpinner message="Consolidating multi-ministry financial ledgers..." />;
  }

  const { overview, thresholdExceededProjects, departmentBudgets, recentTransactions } = data;

  const chartData = departmentBudgets.map((d: any) => ({
    name: d.code,
    Allocated: Number((d.allocatedBudget / 10000000).toFixed(1)),
    Utilized: Number((d.utilizedBudget / 10000000).toFixed(1)),
    Remaining: Number((d.remainingBudget / 10000000).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0F223D] font-heading tracking-tight">
          {t('budget.title', 'Portfolio Budget & Fiscal Monitoring')}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {t('budget.subtitle', 'Macro financial surveillance, burn rate telemetry, and 80% utilization breach safeguards.')}
        </p>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-slate-500">{t('budget.totalAllocated', 'Total Sanctioned Outlay')}</p>
          <p className="text-2xl font-black text-[#0F223D] font-heading mt-1">
            {formatCurrencyINR(overview.totalAllocatedBudget)}
          </p>
          <span className="text-xs text-slate-500">{t('dashboard.kpi.totalOutlay', 'Approved across all active mandates')}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-slate-500">{t('budget.totalUtilized', 'Total Outlay Disbursed')}</p>
          <p className="text-2xl font-black text-indigo-600 font-heading mt-1">
            {formatCurrencyINR(overview.totalBudgetUtilized)}
          </p>
          <span className="text-xs text-slate-500">{overview.budgetUtilizationPercentage}% {t('budget.utilizationRate', 'portfolio burn rate')}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-slate-500">{t('dashboard.budget.remaining', 'Remaining Unspent Balance')}</p>
          <p className="text-2xl font-black text-emerald-600 font-heading mt-1">
            {formatCurrencyINR(overview.remainingBudget)}
          </p>
          <span className="text-xs text-slate-500">{t('dashboard.budget.remaining', 'Available unencumbered balance')}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-slate-500">{t('budget.flaggedAnomalies', '80% Threshold Warnings')}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-black text-rose-600 font-heading">
              {overview.warningProjectsCount} {t('dashboard.charts.projectsUnit', 'Projects')}
            </p>
          </div>
          <span className="text-xs text-rose-600 font-medium">{t('risks.costOverrunRisk', 'Requires expenditure scrutiny')}</span>
        </div>
      </div>

      {/* 80% Threshold Warning Alert Banner & List */}
      {thresholdExceededProjects.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="text-xs font-bold font-heading uppercase tracking-wider">
              {t('budget.flaggedAnomalies', 'Automatic Fiscal Warning: Budget Utilization Exceeds 80% Threshold')}
            </h3>
          </div>
          <p className="text-xs text-slate-700">
            {t('risks.costOverrunRisk', 'The following projects have consumed more than 80% of sanctioned public funds. Physical verification and cost-to-complete audits are strongly advised:')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {thresholdExceededProjects.map((p: any) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="p-3.5 rounded-xl bg-white border border-rose-200 hover:border-rose-400 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#0F223D] truncate max-w-[180px]">{p.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                    {p.utilizationPercentage}% {t('dashboard.kpi.utilized', 'Spent')}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                  <span className="font-semibold">{p.departmentCode}</span>
                  <span>{formatCurrencyINR(p.utilizedBudget)} / {formatCurrencyINR(p.allocatedBudget)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ministry-wise Outlay Comparison BarChart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#0F223D] font-heading">
            {t('dashboard.charts.budgetOutlayTitle', 'Ministry-Wise Sanctioned vs Disbursed Outlays (₹ Crore)')}
          </h3>
          <p className="text-xs text-slate-500">{t('dashboard.charts.amountsInCrore', 'Comparative financial absorption across Union Ministries.')}</p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend formatter={(val) => <span className="text-xs font-semibold text-slate-600">{val}</span>} />
              <Bar dataKey="Allocated" fill="#1A73E8" radius={[4, 4, 0, 0]} name={t('dashboard.budget.sanctioned', 'Sanctioned Outlay')} />
              <Bar dataKey="Utilized" fill="#8b5cf6" radius={[4, 4, 0, 0]} name={t('dashboard.budget.utilized', 'Utilized Outlay')} />
              <Bar dataKey="Remaining" fill="#10b981" radius={[4, 4, 0, 0]} name={t('dashboard.budget.remaining', 'Remaining Balance')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Portfolio Transactions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#0F223D] font-heading">
          {t('budget.transactionHistory', 'Recent Public Fund Disbursements')}
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3 px-3">{t('auditLogs.timestamp', 'Date')}</th>
                <th className="py-3 px-4">{t('dashboard.panels.projectName', 'Project')}</th>
                <th className="py-3 px-3">{t('budget.category', 'Category')}</th>
                <th className="py-3 px-4">{t('auditLogs.details', 'Description')}</th>
                <th className="py-3 px-4 text-right">{t('budget.amount', 'Disbursed Amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {recentTransactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-slate-500">{formatDate(tx.transactionDate)}</td>
                  <td className="py-3 px-4 font-bold text-[#0F223D]">
                    <span
                      onClick={() => navigate(`/projects/${tx.projectId}`)}
                      className="hover:text-[#1A73E8] cursor-pointer"
                    >
                      {tx.project?.name || tx.projectId}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 text-[11px]">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{tx.description}</td>
                  <td className="py-3 px-4 text-right font-black text-[#0F223D]">
                    {formatCurrencyINR(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
