import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { riskApi } from '../api/riskApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrencyINR, formatDate, getRiskBadgeClasses } from '../utils/formatters';

export const RiskIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await riskApi.getPortfolioRiskOverview();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunFullScan = async () => {
    setScanning(true);
    try {
      // Analyze top projects
      if (data?.highRiskProjects) {
        for (const p of data.highRiskProjects.slice(0, 5)) {
          await riskApi.analyzeProject(p.id);
        }
      }
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  if (loading || !data) {
    return <LoadingSpinner message="Evaluating multi-variable risk matrices across ministries..." />;
  }

  const { summary, highRiskProjects, activeAnomalies, activeRisks } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F223D] font-heading tracking-tight">
            ProjectSetu Risk Intelligence Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Predictive vulnerability scoring, critical milestone breaches, and automated anomaly detection.
          </p>
        </div>

        <button
          onClick={handleRunFullScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#1A73E8] border border-slate-200 text-xs font-bold shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Running Diagnostic Scan...' : 'Scan Entire Portfolio'}</span>
        </button>
      </div>

      {/* 4 Severity Tiers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-rose-700">Critical Risk (81-100)</p>
          <p className="text-3xl font-black text-rose-700 font-heading mt-1">{summary.criticalCount}</p>
          <span className="text-[11px] text-rose-600 font-medium">Emergency oversight required</span>
        </div>

        <div className="p-5 rounded-2xl bg-orange-50/80 border border-orange-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-orange-700">High Risk (61-80)</p>
          <p className="text-3xl font-black text-orange-700 font-heading mt-1">{summary.highRiskCount}</p>
          <span className="text-[11px] text-orange-600 font-medium">Close weekly monitoring</span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-amber-700">Moderate Risk (31-60)</p>
          <p className="text-3xl font-black text-amber-700 font-heading mt-1">{summary.moderateRiskCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">Standard tolerance threshold</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-emerald-700">Healthy (0-30)</p>
          <p className="text-3xl font-black text-emerald-700 font-heading mt-1">{summary.lowRiskCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">On schedule & within budget</span>
        </div>
      </div>

      {/* Automated Behavioral Anomalies Feed */}
      {activeAnomalies.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-[#0F223D]">
              Autonomous AI Anomaly Detection Telemetry ({activeAnomalies.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            The platform automatically checks for spend surges, project staleness, repeated deadline slippages, and severe physical variance:
          </p>

          <div className="space-y-2.5">
            {activeAnomalies.map((an: any) => (
              <div
                key={an.id}
                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    an.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {an.type.replace('_', ' ')}
                  </span>
                  <div>
                    <span
                      onClick={() => navigate(`/projects/${an.projectId}`)}
                      className="font-bold text-[#0F223D] hover:text-[#1A73E8] cursor-pointer mr-2"
                    >
                      {an.project?.name}
                    </span>
                    <span className="text-slate-600 block sm:inline mt-0.5 sm:mt-0">{an.description}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500">
                  <span>{formatDate(an.detectedAt)}</span>
                  <button
                    onClick={() => navigate(`/projects/${an.projectId}`)}
                    className="p-1 rounded text-[#1A73E8] hover:text-blue-700"
                    title="Inspect Project"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High-Risk Projects Ranking Watchlist */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#0F223D] font-heading">
          Prioritized High-Risk Projects Watchlist
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-3">Ministry</th>
                <th className="py-3 px-3">Progress</th>
                <th className="py-3 px-3">Budget Utilization</th>
                <th className="py-3 px-3">Active Issues</th>
                <th className="py-3 px-3">Risk Score</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {highRiskProjects.map((p: any) => {
                const util = p.allocatedBudget > 0 ? (p.utilizedBudget / p.allocatedBudget) * 100 : 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#0F223D]">
                      <div className="flex flex-col">
                        <span
                          onClick={() => navigate(`/projects/${p.id}`)}
                          className="hover:text-[#1A73E8] cursor-pointer truncate max-w-sm"
                        >
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">{p.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200/60">
                        {p.department?.code}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="w-24">
                        <span className="font-bold text-[#0F223D] text-[11px]">{p.progressPercentage}%</span>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div className="bg-[#1A73E8] h-full rounded-full" style={{ width: `${p.progressPercentage}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${util >= 80 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {util.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">{formatCurrencyINR(p.utilizedBudget)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-600">{p._count?.risks || 0} Risks / {p._count?.anomalies || 0} Anomalies</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadgeClasses(p.riskScore)}`}>
                        {p.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold text-xs shadow-2xs transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
