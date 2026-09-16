import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Building2,
  Calendar,
  Printer,
} from 'lucide-react';
import { reportApi } from '../api/reportApi';
import { departmentApi } from '../api/departmentApi';
import { Department } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrencyINR } from '../utils/formatters';

export const Reports: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [reportType, setReportType] = useState<any>('ALL_PROJECTS');
  const [departmentId, setDepartmentId] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentApi.listDepartments().then(setDepartments);
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await reportApi.getReport({
        reportType,
        departmentId: departmentId || undefined,
      });
      setReportData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportType, departmentId]);

  const handleExportCsv = () => {
    const url = reportApi.exportCsvUrl({
      reportType,
      departmentId: departmentId || undefined,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F223D] font-heading tracking-tight">
            Integrated Governance Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Export official project auditing records, budget compliance, and delayed project registers in CSV format.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-auto flex-1 flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Report Category:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
          >
            <option value="ALL_PROJECTS">Comprehensive Projects Audit (All Active)</option>
            <option value="DELAYED_PROJECTS">Delayed Projects & Schedule Slippage Register</option>
            <option value="HIGH_RISK">High & Critical Risk Projects Watchlist</option>
            <option value="BUDGET_ANALYSIS">Budget Absorption & Outlay Health Report</option>
          </select>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Filter Ministry:</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden transition-colors"
          >
            <option value="">All Ministries</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Data Table */}
      {loading ? (
        <LoadingSpinner message="Querying cross-ministerial database tables..." />
      ) : reportData ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-[#0F223D]">
              Generated {reportData.totalRecords} records • {reportData.generatedAt}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-3">Ministry</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3">Sanctioned (Cr)</th>
                  <th className="py-3 px-3">Utilized (Cr)</th>
                  <th className="py-3 px-3">Utilization</th>
                  <th className="py-3 px-3">Risk</th>
                  <th className="py-3 px-4">Schedule Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {reportData.data.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#0F223D]">
                      <div>{r.name}</div>
                      <span className="text-[10px] text-slate-500 font-normal">{r.location}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200/60">
                        {r.departmentCode}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200/80 text-slate-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-blue-700">{r.progress}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">₹{r.allocatedBudgetCr} Cr</td>
                    <td className="py-3 px-3 font-medium text-slate-800">₹{r.utilizedBudgetCr} Cr</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{r.budgetUtilization}</td>
                    <td className="py-3 px-3 font-black text-amber-700">{r.riskScore}/100</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{r.scheduleStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};
