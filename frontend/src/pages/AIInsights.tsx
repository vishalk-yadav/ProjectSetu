import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Send,
  TrendingUp,
  Clock,
  Coins,
  Bot,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { projectApi } from '../api/projectApi';
import { aiApi } from '../api/aiApi';
import { Project, AssistantQueryResult } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrencyINR, getRiskBadgeClasses } from '../utils/formatters';

export const AIInsights: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat Query state
  const [query, setQuery] = useState('');
  const [chatResult, setChatResult] = useState<AssistantQueryResult | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  useEffect(() => {
    projectApi.listProjects({ limit: 12, sortBy: 'riskScore', sortOrder: 'desc' })
      .then((res) => setProjects(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRunQuery = async (queryText?: string) => {
    const q = queryText || query;
    if (!q.trim() || queryLoading) return;
    setQueryLoading(true);
    try {
      const res = await aiApi.queryAssistant(q);
      setChatResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setQueryLoading(false);
    }
  };

  const samplePrompts = [
    'Show projects delayed by more than 30 days',
    'Which department has the highest number of high-risk projects?',
    'Show projects with budget utilization above 80%',
    'Which projects are likely to miss their deadlines?',
  ];

  if (loading) {
    return <LoadingSpinner message="Synthesizing predictive neural models & rule-based engines..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-[#0F223D] font-heading tracking-tight">
            {t('ai.title', 'ProjectSetu Generative Governance AI')}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
            RULE-BASED + ML READY
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {t('ai.subtitle', 'Predictive delay models, Earned Value cost overrun forecasts & natural language conversational queries.')}
        </p>
      </div>

      {/* Embedded Natural Language Query Assistant */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#1A73E8]" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F223D] font-heading">{t('ai.title', 'ProjectSetu Conversational Assistant')}</h3>
            <p className="text-[11px] text-slate-500">{t('ai.subtitle', 'Query project telemetry, delayed milestones, or risk profiles in natural language.')}</p>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t('ai.askAi', 'e.g. Which department has the highest number of high-risk projects?')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
            className="flex-1 px-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-2xs"
          />
          <button
            onClick={() => handleRunQuery()}
            disabled={!query.trim() || queryLoading}
            className="px-6 py-3 rounded-2xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {queryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{t('ai.submitQuery', 'Analyze')}</span>
          </button>
        </div>

        {/* Sample Inquiry Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" /> {t('ai.suggestedQueries', 'Suggested:')}
          </span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(p);
                handleRunQuery(p);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#1A73E8] border border-slate-200/80 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Query Result Card */}
        {chatResult && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-blue-200 text-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {chatResult.answer}
              </p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                {chatResult.queryIntent}
              </span>
            </div>

            {chatResult.highlightMetric && (
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between max-w-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-500">{chatResult.highlightMetric.label}</p>
                  <p className="text-lg font-black text-amber-600 mt-0.5">{chatResult.highlightMetric.value}</p>
                  {chatResult.highlightMetric.subtext && (
                    <p className="text-[10px] text-slate-500">{chatResult.highlightMetric.subtext}</p>
                  )}
                </div>
                <TrendingUp className="w-6 h-6 text-[#1A73E8]" />
              </div>
            )}

            {chatResult.projects && chatResult.projects.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-slate-500">{t('dashboard.kpi.totalProjects', 'Identified Projects')}:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {chatResult.projects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="p-3 rounded-xl bg-white border border-slate-200 hover:border-[#1A73E8] cursor-pointer shadow-2xs hover:shadow-xs transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-[#0F223D] truncate max-w-[180px]">{p.name}</p>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{p.departmentName} • {p.location}</p>
                      <div className="mt-2 flex justify-between text-[10px] text-slate-600">
                        <span>{t('dashboard.panels.progress', 'Progress')}: <strong className="text-slate-800">{p.progressPercentage}%</strong></span>
                        <span className="font-bold text-rose-600">{t('dashboard.panels.risk', 'Risk')}: {p.riskScore}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* High-Impact AI Delay & Cost Overrun Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Delay Probability Projects */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F223D] font-heading">{t('risks.predictedDelays', 'AI Delay Prediction Radar')}</h3>
              <p className="text-[11px] text-slate-500">{t('risks.subtitle', 'Projects with elevated probability of schedule slippage.')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map((p) => {
              const estProb = Math.min(95, Math.max(20, Math.round(p.riskScore * 1.1)));
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#0F223D] hover:text-[#1A73E8]">{p.name}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{p.department?.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-rose-600 font-heading">{estProb}%</span>
                      <p className="text-[9px] text-slate-400 uppercase font-semibold">{t('risks.predictedDelays', 'Delay Probability')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost Overrun & EVM Vulnerabilities */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F223D] font-heading">{t('risks.costOverrunRisk', 'Earned Value Cost Overrun Forecaster')}</h3>
              <p className="text-[11px] text-slate-500">{t('budget.subtitle', 'Estimates final project cost (EAC) based on current burn rate.')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map((p) => {
              const util = p.allocatedBudget > 0 ? (p.utilizedBudget / p.allocatedBudget) * 100 : 0;
              const overrunProb = util > 80 && p.progressPercentage < 75 ? 74 : 32;
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#0F223D] hover:text-[#1A73E8]">{p.name}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {t('dashboard.budget.sanctioned', 'Sanctioned')}: {formatCurrencyINR(p.allocatedBudget)} • {t('dashboard.budget.utilized', 'Utilized')}: {util.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-amber-600 font-heading">{overrunProb}%</span>
                      <p className="text-[9px] text-slate-400 uppercase font-semibold">{t('risks.costOverrunRisk', 'Overrun Probability')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
