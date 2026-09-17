import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Clock,
  ShieldAlert,
  Coins,
  Receipt,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  Trash2,
  ExternalLink,
  Activity,
  Layers,
  AlertTriangle,
  AlertOctagon,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { projectApi } from '../api/projectApi';
import { budgetApi } from '../api/budgetApi';
import { riskApi } from '../api/riskApi';
import { aiApi } from '../api/aiApi';
import { documentApi } from '../api/documentApi';
import { Project, Milestone, DelayPrediction, CostPrediction, SmartSummary, RiskAnalysis } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { UpdateProgressModal } from '../components/projects/UpdateProgressModal';
import { GanttTimeline } from '../components/projects/GanttTimeline';
import { ProjectDiscussions } from '../components/projects/ProjectDiscussions';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  formatCurrencyINR,
  formatDate,
  getRiskBadgeClasses,
  getStatusBadgeClasses,
  getPriorityBadgeClasses,
} from '../utils/formatters';

export const ProjectDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'budget' | 'timeline' | 'risks' | 'ai' | 'documents' | 'discussions'>('overview');

  // AI states
  const [delayPrediction, setDelayPrediction] = useState<DelayPrediction | null>(null);
  const [costPrediction, setCostPrediction] = useState<CostPrediction | null>(null);
  const [smartSummary, setSmartSummary] = useState<SmartSummary | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Risk Live Analysis state
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [analyzingRisk, setAnalyzingRisk] = useState(false);

  // Modals
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [riskModalOpen, setRiskModalOpen] = useState(false);

  // Form states for modals
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    expectedCompletionDate: new Date().toISOString().split('T')[0],
    responsiblePerson: 'Resident Engineer',
    priority: 'HIGH',
  });

  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: 'Civil Works',
    description: '',
  });

  const [newRisk, setNewRisk] = useState({
    riskType: 'Schedule',
    severity: 'HIGH',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState('Progress Report');

  const loadProjectData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await projectApi.getProjectById(id);
      setProject(data);
    } catch (e) {
      console.error('Failed to load project details', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  // Load AI predictions and Risk analysis when opening those tabs
  useEffect(() => {
    if (activeTab === 'ai' && id && !delayPrediction) {
      setAiLoading(true);
      Promise.all([
        aiApi.getDelayPrediction(id),
        aiApi.getCostPrediction(id),
        aiApi.getProjectSummary(id),
      ])
        .then(([delay, cost, summary]) => {
          setDelayPrediction(delay);
          setCostPrediction(cost);
          setSmartSummary(summary);
        })
        .finally(() => setAiLoading(false));
    }

    if (activeTab === 'risks' && id && !riskAnalysis) {
      riskApi.getProjectRisk(id).then(setRiskAnalysis);
    }
  }, [activeTab, id]);

  const handleRunLiveRiskScan = async () => {
    if (!id) return;
    setAnalyzingRisk(true);
    try {
      const res = await riskApi.analyzeProject(id);
      setRiskAnalysis(res.riskAnalysis);
      await loadProjectData();
    } catch (e) {
      console.error('Failed to run risk analysis', e);
    } finally {
      setAnalyzingRisk(false);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newMilestone.name) return;
    try {
      await projectApi.createMilestone(id, newMilestone);
      setMilestoneModalOpen(false);
      await loadProjectData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleMilestone = async (milestone: Milestone) => {
    try {
      const nextStatus = milestone.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
      const nextProgress = nextStatus === 'COMPLETED' ? 100 : 50;
      await projectApi.updateMilestone(milestone.id, {
        status: nextStatus,
        progressPercentage: nextProgress,
      });
      await loadProjectData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newTransaction.amount) return;
    try {
      await budgetApi.addTransaction({
        projectId: id,
        amount: parseFloat(newTransaction.amount),
        category: newTransaction.category,
        description: newTransaction.description,
      });
      setTransactionModalOpen(false);
      setNewTransaction({ amount: '', category: 'Civil Works', description: '' });
      await loadProjectData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newRisk.description) return;
    try {
      await riskApi.addRisk({
        projectId: id,
        riskType: newRisk.riskType,
        severity: newRisk.severity,
        description: newRisk.description,
      });
      setRiskModalOpen(false);
      setNewRisk({ riskType: 'Schedule', severity: 'HIGH', description: '' });
      await loadProjectData();
      if (activeTab === 'risks') {
        const fresh = await riskApi.getProjectRisk(id);
        setRiskAnalysis(fresh);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedFile) return;
    const formData = new FormData();
    formData.append('projectId', id);
    formData.append('category', docCategory);
    formData.append('file', selectedFile);
    try {
      await documentApi.uploadDocument(formData);
      setDocumentModalOpen(false);
      setSelectedFile(null);
      await loadProjectData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentApi.deleteDocument(docId);
      await loadProjectData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !project) {
    return <LoadingSpinner message="Retrieving high-resolution project telemetry..." />;
  }

  const budgetPct = project.allocatedBudget > 0 ? (project.utilizedBudget / project.allocatedBudget) * 100 : 0;
  const remainingBudget = Math.max(0, project.allocatedBudget - project.utilizedBudget);

  const tabs = [
    { id: 'overview', label: t('nav.overview', 'Overview'), icon: Layers },
    { id: 'milestones', label: `${t('nav.milestones', 'Milestones')} (${project.milestones?.length || 0})`, icon: CheckCircle2 },
    { id: 'timeline', label: t('milestones.timeline', 'Gantt Schedule'), icon: Clock },
    { id: 'budget', label: t('nav.budget', 'Budget & Spend'), icon: Coins },
    { id: 'risks', label: `${t('nav.risks', 'Risks & Alerts')} (${(project.risks?.length || 0) + (project.anomalies?.length || 0)})`, icon: ShieldAlert },
    { id: 'discussions', label: 'Team Coordination', icon: MessageSquare },
    { id: 'ai', label: t('nav.aiInsights', 'AI Predictive Insights'), icon: Sparkles, highlight: true },
    { id: 'documents', label: `${t('nav.documents', 'Documents')} (${project.documents?.length || 0})`, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Back button & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0 mt-1 shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-blue-50 text-[#1A73E8] border border-blue-200 uppercase">
                {project.department?.code || 'MINISTRY'}
              </span>
              {project.projectCode && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                  {project.projectCode}
                </span>
              )}
              {project.dataClassification && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {project.dataClassification.replace('_', ' ')}
                </span>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClasses(project.status)}`}>
                {project.status.replace('_', ' ')}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getPriorityBadgeClasses(project.priority)}`}>
                {project.priority} PRIORITY
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getRiskBadgeClasses(project.riskScore)}`}>
                RISK: {project.riskScore}/100
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F223D] font-heading mt-1.5 leading-tight">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{project.department?.name}</span>
              {project.implementingAgency && (
                <>
                  <span>•</span>
                  <span className="text-blue-700 font-semibold">{project.implementingAgency}</span>
                </>
              )}
              <span>•</span>
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{project.location}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {project.officialSourceUrl && (
            <a
              href={project.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => setProgressModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>{t('projects.updateProgress', 'Update Progress')}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border border-slate-200/80 bg-white p-1.5 rounded-2xl shadow-2xs overflow-x-auto no-scrollbar gap-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-50 text-[#1A73E8] font-bold border border-blue-200/60 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              } ${t.highlight ? 'text-amber-700 font-bold' : ''}`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.highlight && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('departments.physicalProgress')}</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-[#0F223D] font-heading">{project.progressPercentage}%</span>
                <span className="text-xs text-[#1A73E8] font-bold">{project.status}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#1A73E8] h-full rounded-full" style={{ width: `${project.progressPercentage}%` }} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('departments.sanctionedOutlay')}</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-[#0F223D] font-heading">{formatCurrencyINR(project.allocatedBudget)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Utilized: <strong className="text-slate-800">{formatCurrencyINR(project.utilizedBudget)}</strong> ({budgetPct.toFixed(1)}%)
                {project.revisedBudget && project.revisedBudget !== project.allocatedBudget && (
                  <span className="block text-[10px] text-amber-600 font-semibold mt-0.5">
                    Revised: {formatCurrencyINR(project.revisedBudget)}
                  </span>
                )}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('departments.riskRating')}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-3xl font-black text-[#0F223D] font-heading">{project.riskScore}/100</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getRiskBadgeClasses(project.riskScore)}`}>
                  {project.riskScore >= 61 ? 'HIGH' : project.riskScore >= 31 ? 'MODERATE' : 'LOW'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Composite multi-factor rating</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target Commissioning</p>
              <div className="mt-2">
                <span className="text-xl font-bold text-[#0F223D]">{formatDate(project.expectedCompletionDate)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Started: {formatDate(project.startDate)}</p>
            </div>
          </div>

          {/* Project Details & Project Manager Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-[#0F223D] font-heading">Project Mandate & Scope</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{project.description}</p>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Nodal Ministry</span>
                  <span className="text-[#0F223D] font-semibold">{project.department?.name}</span>
                </div>
                {project.implementingAgency && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Implementing Agency</span>
                    <span className="text-[#0F223D] font-semibold">{project.implementingAgency}</span>
                  </div>
                )}
                {project.state && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">State / UT</span>
                    <span className="text-[#0F223D] font-semibold">{project.state}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Site Location</span>
                  <span className="text-[#0F223D] font-semibold">{project.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">GPS Coordinates</span>
                  <span className="text-[#0F223D] font-semibold">{project.latitude}, {project.longitude}</span>
                </div>
                {project.officialSourceUrl && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Web Portal</span>
                    <a
                      href={project.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1A73E8] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-[#0F223D] font-heading">Assigned Project Authority</h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-[#0F223D]">{project.projectManager?.name || 'Chief Resident Engineer'}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{project.projectManager?.email || 'engineering-cell@nic.in'}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1A73E8] border border-blue-200">
                  {project.projectManager?.role || 'PROJECT_MANAGER'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Responsible for bi-weekly telemetry submissions, contractor invoice clearance, and critical path milestone approvals.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F223D] font-heading">Project Execution Milestones</h3>
              <p className="text-xs text-slate-500">Overdue milestones automatically flag schedule warnings.</p>
            </div>
            <button
              onClick={() => setMilestoneModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="divide-y divide-slate-100">
              {project.milestones && project.milestones.length > 0 ? (
                project.milestones.map((m) => {
                  const now = new Date();
                  const isOverdue = m.status !== 'COMPLETED' && new Date(m.expectedCompletionDate) < now;
                  return (
                    <div key={m.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleMilestone(m)}
                          className={`mt-0.5 p-1 rounded-lg border transition-colors cursor-pointer ${
                            m.status === 'COMPLETED'
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : 'bg-slate-100 text-slate-400 border-slate-300 hover:border-blue-500'
                          }`}
                          title="Click to toggle completed state"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#0F223D]">{m.name}</h4>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                              m.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isOverdue
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {m.status === 'COMPLETED' ? 'COMPLETED' : isOverdue ? 'OVERDUE' : m.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{m.description || 'Milestone deliverable'}</p>
                          <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-2">
                            <span>Deadline: <strong className="text-slate-800">{formatDate(m.expectedCompletionDate)}</strong></span>
                            <span>Officer: {m.responsiblePerson}</span>
                          </div>
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
                          onClick={() => handleToggleMilestone(m)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {m.status === 'COMPLETED' ? 'Mark Incomplete' : 'Mark Done'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No milestones configured for this project.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUDGET & SPEND */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F223D] font-heading">Budget Allocation & Expenditure</h3>
              <p className="text-xs text-slate-500">Track financial burn rate against physical progress milestones.</p>
            </div>
            <button
              onClick={() => setTransactionModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expenditure</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] font-bold uppercase text-slate-400">Sanctioned Outlay</p>
              <p className="text-2xl font-black text-[#0F223D] font-heading mt-1">{formatCurrencyINR(project.allocatedBudget)}</p>
              <span className="text-xs text-slate-500">100% Approved</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] font-bold uppercase text-slate-400">Utilized Outlay</p>
              <p className="text-2xl font-black text-purple-600 font-heading mt-1">{formatCurrencyINR(project.utilizedBudget)}</p>
              <span className="text-xs text-slate-500">{budgetPct.toFixed(1)}% disbursed</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] font-bold uppercase text-slate-400">Remaining Balance</p>
              <p className="text-2xl font-black text-emerald-600 font-heading mt-1">{formatCurrencyINR(remainingBudget)}</p>
              <span className="text-xs text-slate-500">{(100 - budgetPct).toFixed(1)}% remaining</span>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
            <h4 className="text-xs font-bold text-[#0F223D] font-heading uppercase tracking-wider mb-4">
              Expenditure Ledger Transactions ({project.budgetTransactions?.length || 0})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Disbursed Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {project.budgetTransactions && project.budgetTransactions.length > 0 ? (
                    project.budgetTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 text-slate-500 font-medium">{formatDate(tx.transactionDate)}</td>
                        <td className="py-3 px-3 font-bold text-[#1A73E8]">{tx.category}</td>
                        <td className="py-3 px-3 text-slate-600">{tx.description}</td>
                        <td className="py-3 px-3 text-right font-black text-[#0F223D]">
                          {formatCurrencyINR(tx.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[#0F223D] font-heading">Project Chronology & Milestone Roadmap</h3>
            <p className="text-xs text-slate-500">Stage-gate execution pathway and chronological status.</p>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
            {/* Start Node */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#1A73E8] border-4 border-white shadow-xs" />
              <p className="text-xs font-bold text-[#0F223D]">Project Commissioned</p>
              <p className="text-[11px] text-slate-500">{formatDate(project.startDate)}</p>
            </div>

            {/* Milestones in chronological order */}
            {project.milestones?.map((m) => {
              const isCompleted = m.status === 'COMPLETED';
              const isOverdue = !isCompleted && new Date(m.expectedCompletionDate) < new Date();
              return (
                <div key={m.id} className="relative">
                  <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-xs ${
                    isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-slate-400'
                  }`} />
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 max-w-xl shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#0F223D]">{m.name}</h4>
                      <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                        isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isOverdue ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {isCompleted ? 'COMPLETED' : isOverdue ? 'OVERDUE' : m.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{m.description}</p>
                    <p className="text-[10px] text-slate-400 mt-2">Target Date: {formatDate(m.expectedCompletionDate)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-bold text-[#0F223D] font-heading">Interactive Master Project Schedule</h3>
            <p className="text-xs text-slate-500">Visual Gantt timeline depicting milestone execution deadlines.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Project Commissioning Date</span>
              <p className="font-bold text-[#0F223D] mt-0.5">{formatDate(project.startDate)}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Completion Deadline</span>
              <p className="font-bold text-[#0F223D] mt-0.5">{formatDate(project.expectedCompletionDate)}</p>
            </div>
          </div>

          {/* Interactive Gantt Timeline */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <GanttTimeline
              milestones={project.milestones || []}
              projectStartDate={project.startDate}
              projectExpectedDate={project.expectedCompletionDate}
              onUpdateMilestone={handleToggleMilestone}
              canEdit={true}
            />
          </div>
        </div>
      )}

      {/* TAB: TEAM & DEPARTMENT DISCUSSIONS */}
      {activeTab === 'discussions' && (
        <ProjectDiscussions projectId={project.id} />
      )}

      {/* TAB 5: RISKS & ANOMALIES */}
      {activeTab === 'risks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F223D] font-heading">ProjectSetu Risk Intelligence Engine</h3>
              <p className="text-xs text-slate-500">Automated multi-factor risk scoring with explainability audit.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunLiveRiskScan}
                disabled={analyzingRisk}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#1A73E8] text-xs font-bold border border-slate-200 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyzingRisk ? 'animate-spin' : ''}`} />
                <span>{analyzingRisk ? 'Scanning...' : 'Run Telemetry Scan'}</span>
              </button>
              <button
                onClick={() => setRiskModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Log Risk</span>
              </button>
            </div>
          </div>

          {/* Risk Score & Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-500">Composite Risk Score</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#0F223D] font-heading">{project.riskScore}</span>
                  <span className="text-slate-400 font-bold">/ 100</span>
                </div>
                <div className="mt-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskBadgeClasses(project.riskScore)}`}>
                    {project.riskScore >= 81 ? 'CRITICAL RISK' : project.riskScore >= 61 ? 'HIGH RISK' : project.riskScore >= 31 ? 'MODERATE RISK' : 'LOW RISK'}
                  </span>
                </div>
              </div>

              {riskAnalysis && (
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Factor Breakdown:</p>
                  <div className="flex justify-between text-slate-600">
                    <span>Schedule Delay Risk:</span>
                    <span className="font-bold text-[#0F223D]">{riskAnalysis.breakdown.delayRisk} / 25</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Budget Variance Risk:</span>
                    <span className="font-bold text-[#0F223D]">{riskAnalysis.breakdown.budgetRisk} / 25</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Milestone Bottlenecks:</span>
                    <span className="font-bold text-[#0F223D]">{riskAnalysis.breakdown.milestoneRisk} / 20</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Progress Lag Variance:</span>
                    <span className="font-bold text-[#0F223D]">{riskAnalysis.breakdown.progressRisk} / 20</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Active Issues & Anomalies:</span>
                    <span className="font-bold text-[#0F223D]">{riskAnalysis.breakdown.issueRisk} / 10</span>
                  </div>
                </div>
              )}
            </div>

            {/* Explainable Reasons & Recommendations */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h4 className="text-xs font-bold text-[#0F223D] font-heading uppercase tracking-wider">
                Why Did the Project Receive This Risk Score?
              </h4>

              {riskAnalysis ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {riskAnalysis.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold uppercase text-[#1A73E8] mb-2">Recommended Corrective Actions:</p>
                    <div className="space-y-2">
                      {riskAnalysis.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Loading risk explainability factors...</p>
              )}
            </div>
          </div>

          {/* Active Anomalies Section */}
          {project.anomalies && project.anomalies.length > 0 && (
            <div className="bg-rose-50/40 border border-rose-200 rounded-2xl p-5 shadow-2xs">
              <h4 className="text-xs font-bold text-rose-700 font-heading uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" /> Detected Telemetry Anomalies ({project.anomalies.length})
              </h4>
              <div className="space-y-2">
                {project.anomalies.map((an) => (
                  <div key={an.id} className="p-3 rounded-xl bg-white border border-rose-200 text-xs text-rose-800 flex items-start justify-between shadow-2xs">
                    <div>
                      <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 mr-2">
                        {an.type.replace('_', ' ')}
                      </span>
                      <span>{an.description}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-3">{formatDate(an.detectedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks Logged */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
            <h4 className="text-xs font-bold text-[#0F223D] font-heading uppercase tracking-wider mb-3">
              Identified Operational & Environmental Risks ({project.risks?.length || 0})
            </h4>
            <div className="space-y-2">
              {project.risks && project.risks.length > 0 ? (
                project.risks.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#0F223D]">{r.riskType} Risk</span>
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${getRiskBadgeClasses(r.severity === 'CRITICAL' ? 90 : r.severity === 'HIGH' ? 70 : 40)}`}>
                          {r.severity}
                        </span>
                        <span className="text-[10px] text-slate-500">Status: {r.status}</span>
                      </div>
                      <p className="text-slate-600">{r.description}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-3">{formatDate(r.createdAt)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No active risks logged.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AI INSIGHTS & SUMMARY */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 border border-amber-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F223D] font-heading">AI Predictive Intelligence Engine</h3>
                <p className="text-xs text-slate-600">Statistical forecasting for schedule slippage, cost overruns & automated briefing.</p>
              </div>
            </div>
          </div>

          {aiLoading ? (
            <LoadingSpinner message="Calculating predictive regression models and EVM matrices..." />
          ) : (
            <>
              {/* Delay & Cost Overrun Predictions Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Delay Predictor Card */}
                {delayPrediction && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">AI Delay Predictor</p>
                        <h4 className="text-lg font-bold text-[#0F223D] font-heading mt-0.5">
                          {delayPrediction.statusText}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-rose-600 font-heading">
                          {delayPrediction.delayProbability}%
                        </span>
                        <p className="text-[10px] text-slate-400">Delay Probability</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Estimated Schedule Slippage:</span>
                        <span className="font-bold text-[#0F223D]">+{delayPrediction.estimatedDelayDays} Days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Projected Completion:</span>
                        <span className="font-bold text-[#0F223D]">{formatDate(delayPrediction.projectedCompletionDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Model Confidence:</span>
                        <span className="font-bold text-emerald-600">{delayPrediction.confidenceScore}%</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Key Influencing Factors:</p>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {delayPrediction.factors.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#1A73E8] shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
                      <p className="text-[10px] font-bold text-[#1A73E8] uppercase">Recommended Action:</p>
                      <p className="text-slate-700 mt-0.5">{delayPrediction.recommendedAction}</p>
                    </div>
                  </div>
                )}

                {/* Cost Overrun Predictor Card */}
                {costPrediction && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Cost Overrun Intelligence</p>
                        <h4 className="text-lg font-bold text-[#0F223D] font-heading mt-0.5">
                          {costPrediction.costOverrunProbability >= 50 ? 'ELEVATED OVERRUN RISK' : 'STABLE FISCAL ESTIMATE'}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-amber-600 font-heading">
                          {costPrediction.costOverrunProbability}%
                        </span>
                        <p className="text-[10px] text-slate-400">Overrun Probability</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cost Performance Index (CPI):</span>
                        <span className={`font-bold ${costPrediction.costPerformanceIndex < 1 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {costPrediction.costPerformanceIndex}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Schedule Performance Index (SPI):</span>
                        <span className="font-bold text-[#0F223D]">{costPrediction.schedulePerformanceIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Predicted Final Cost (EAC):</span>
                        <span className="font-bold text-[#0F223D]">{formatCurrencyINR(costPrediction.predictedFinalCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Projected Variance at Completion:</span>
                        <span className={`font-bold ${costPrediction.projectedVariance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {costPrediction.projectedVariance > 0 ? `+${formatCurrencyINR(costPrediction.projectedVariance)}` : 'Nil'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Mitigation Directives:</p>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {costPrediction.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* ProjectSetu Smart Summary Narrative */}
              {smartSummary && (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#0F223D] font-heading flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Executive Governance Briefing (AI Smart Summary)
                    </h3>
                    <span className="text-[10px] text-slate-400">Generated: {formatDate(smartSummary.lastGeneratedAt)}</span>
                  </div>

                  <p className="text-sm font-bold text-[#1A73E8] bg-blue-50/70 p-3.5 rounded-xl border border-blue-100">
                    {smartSummary.headline}
                  </p>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {smartSummary.executiveSummary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Timeline Health</p>
                      <p className="text-xs text-slate-700">{smartSummary.timelineStatus}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Fiscal Health</p>
                      <p className="text-xs text-slate-700">{smartSummary.financialStatus}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 7: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0F223D] font-heading">Document Management Repository</h3>
              <p className="text-xs text-slate-500">Proposals, progress reports, audit clearances, and inspection memos.</p>
            </div>
            <button
              onClick={() => setDocumentModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="divide-y divide-slate-100">
              {project.documents && project.documents.length > 0 ? (
                project.documents.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-50 text-[#1A73E8] border border-blue-200">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#0F223D]">{doc.name}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                          <span className="px-2 py-0.2 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                            {doc.category}
                          </span>
                          <span>Uploaded: {formatDate(doc.uploadedAt)}</span>
                          {doc.uploadedBy && <span>By: {doc.uploadedBy.name}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Download</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No documents uploaded for this project yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Management Modals */}
          {/* Progress Update Modal */}
          <UpdateProgressModal
            isOpen={progressModalOpen}
            onClose={() => setProgressModalOpen(false)}
            project={project}
            onSuccess={loadProjectData}
          />

      {/* Milestone Modal */}
      <Modal
        isOpen={milestoneModalOpen}
        onClose={() => setMilestoneModalOpen(false)}
        title="Establish Execution Milestone"
        subtitle={`Schedule deliverable for ${project.name}`}
      >
        <form onSubmit={handleCreateMilestone} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Milestone Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Pier Cap & Girder Erection"
              value={newMilestone.name}
              onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deadline *</label>
              <input
                type="date"
                required
                value={newMilestone.expectedCompletionDate}
                onChange={(e) => setNewMilestone({ ...newMilestone, expectedCompletionDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Responsible Person</label>
              <input
                type="text"
                value={newMilestone.responsiblePerson}
                onChange={(e) => setNewMilestone({ ...newMilestone, responsiblePerson: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setMilestoneModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-[#1A73E8] hover:bg-blue-600 rounded-xl text-white font-bold shadow-xs transition-colors">Sanction Milestone</button>
          </div>
        </form>
      </Modal>

      {/* Record Transaction Modal */}
      <Modal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        title="Record Financial Disbursement"
        subtitle={`Log expenditure for ${project.name}`}
      >
        <form onSubmit={handleAddTransaction} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Amount (INR) *</label>
            <input
              type="number"
              required
              placeholder="e.g. 50000000 (5 Cr)"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Expenditure Category</label>
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Civil Works">Civil Works</option>
              <option value="Procurement">Procurement</option>
              <option value="Technology">Technology</option>
              <option value="Equipment">Equipment</option>
              <option value="Consultancy">Consultancy</option>
              <option value="Logistics">Logistics</option>
              <option value="Contingency">Contingency</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Voucher Description</label>
            <textarea
              rows={2}
              placeholder="Invoice reference, itemized work accomplished..."
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setTransactionModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-[#1A73E8] hover:bg-blue-600 rounded-xl text-white font-bold shadow-xs transition-colors">Record Disbursement</button>
          </div>
        </form>
      </Modal>

      {/* Log Risk Modal */}
      <Modal
        isOpen={riskModalOpen}
        onClose={() => setRiskModalOpen(false)}
        title="Log Project Operational Risk"
        subtitle={`Flag vulnerability for ${project.name}`}
      >
        <form onSubmit={handleAddRisk} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Risk Category</label>
              <select
                value={newRisk.riskType}
                onChange={(e) => setNewRisk({ ...newRisk, riskType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Schedule">Schedule Slippage</option>
                <option value="Cost">Budget Escalation</option>
                <option value="Regulatory">Regulatory Clearances</option>
                <option value="Environmental">Environmental & Weather</option>
                <option value="Technical">Technical Failure</option>
                <option value="Vendor">Contractor / Vendor</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity Tier</label>
              <select
                value={newRisk.severity}
                onChange={(e) => setNewRisk({ ...newRisk, severity: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Risk Description & Impact *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe ground reality, delay impact, or contractual hurdle..."
              value={newRisk.description}
              onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setRiskModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-white font-bold shadow-xs transition-colors">Flag Risk</button>
          </div>
        </form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={documentModalOpen}
        onClose={() => setDocumentModalOpen(false)}
        title="Upload Project Document"
        subtitle={`Attach official documentation for ${project.name}`}
      >
        <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Category</label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Project Proposal">Project Proposal</option>
              <option value="Progress Report">Progress Report</option>
              <option value="Financial Report">Financial Report</option>
              <option value="Approval Document">Approval Document</option>
              <option value="Inspection Report">Inspection Report</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select File *</label>
            <input
              type="file"
              required
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setDocumentModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors">Cancel</button>
            <button type="submit" disabled={!selectedFile} className="px-5 py-2 bg-[#1A73E8] hover:bg-blue-600 rounded-xl text-white font-bold shadow-xs disabled:opacity-50 transition-colors">Upload File</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
