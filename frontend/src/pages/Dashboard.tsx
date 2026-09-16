import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  ShieldAlert,
  BarChart3,
  HeartPulse,
  Plus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  FileSpreadsheet,
  ListFilter,
  Activity,
  Users,
  CheckSquare,
  History,
  Globe,
  Building2,
  Sliders,
  AlertOctagon,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { projectApi } from '../api/projectApi';
import { departmentApi } from '../api/departmentApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin, isDeptAdmin, isProjectManager, isCitizen, canSanctionProjects } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await projectApi.getDashboardStats();
      setStats(statsData);
    } catch (e) {
      console.error('Failed to load dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading || !stats) {
    return <LoadingSpinner message="Aggregating multi-department telemetries & budgets..." />;
  }

  // Sanctioned vs Utilized Outlay data matching the mockup
  const outlayData = [
    { name: 'Sanctioned', value: 8327, displayValue: '8,327', color: '#1A73E8' },
    { name: 'Utilized', value: 5512, displayValue: '5,512', color: '#10B981' },
    { name: 'Remaining', value: 2815, displayValue: '2,815', color: '#F59E0B' },
  ];

  // Project Status Distribution donut data
  const statusChartData = [
    { name: 'In Progress', count: 14, pct: '66.7', color: '#1A73E8' },
    { name: 'Completed', count: 2, pct: '9.5', color: '#10B981' },
    { name: 'Delayed', count: 2, pct: '9.5', color: '#EF4444' },
    { name: 'Not Started', count: 3, pct: '14.3', color: '#94A3B8' },
  ];

  // Project Health Overview donut data
  const healthChartData = [
    { name: 'Healthy (0-30)', count: 9, pct: '42.9', color: '#10B981' },
    { name: 'Moderate (31-60)', count: 7, pct: '33.3', color: '#F59E0B' },
    { name: 'High Risk (61-80)', count: 3, pct: '14.3', color: '#F97316' },
    { name: 'Critical (81-100)', count: 2, pct: '9.5', color: '#EF4444' },
  ];

  // Department Performance Index
  const departmentPerformance = [
    { name: 'Ministry of Road Transport & Highways', progress: 78, color: '#1A73E8' },
    { name: 'Ministry of Railways', progress: 65, color: '#10B981' },
    { name: 'Ministry of Power', progress: 52, color: '#F97316' },
    { name: 'Ministry of Jal Shakti', progress: 48, color: '#8B5CF6' },
    { name: 'Ministry of Urban Development', progress: 40, color: '#64748B' },
  ];

  // Priority Projects Progress vs Risk
  const priorityProjects = [
    {
      name: 'BharatMala Phase II',
      progress: 72,
      risk: 'Moderate',
      riskColor: 'bg-amber-500',
      status: 'On Track',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      name: 'Dedicated Freight Corridor',
      progress: 55,
      risk: 'High',
      riskColor: 'bg-rose-500',
      status: 'Delayed',
      statusClass: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      name: 'PM GatiShakti Hub',
      progress: 34,
      risk: 'Critical',
      riskColor: 'bg-rose-600',
      status: 'At Risk',
      statusClass: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      name: 'National Water Grid',
      progress: 81,
      risk: 'Low',
      riskColor: 'bg-emerald-500',
      status: 'On Track',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      name: 'Smart Cities Mission',
      progress: 46,
      risk: 'Moderate',
      riskColor: 'bg-amber-500',
      status: 'Delayed',
      statusClass: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  // Live Activity Feed
  const activityFeed = [
    {
      title: 'New project sanctioned',
      subtitle: 'Delhi-Meerut RRTS Extension',
      time: '10 min ago',
      color: 'bg-emerald-500',
    },
    {
      title: 'Progress update submitted',
      subtitle: 'Mumbai Coastal Road Package 2',
      time: '32 min ago',
      color: 'bg-amber-500',
    },
    {
      title: 'Risk alert triggered',
      subtitle: 'Eastern Dedicated Freight Corridor',
      time: '1 hour ago',
      color: 'bg-rose-500',
    },
    {
      title: 'Department meeting scheduled',
      subtitle: 'Ministry of Power',
      time: '2 hours ago',
      color: 'bg-purple-500',
    },
    {
      title: 'Project milestone achieved',
      subtitle: 'Atal Tunnel – Phase II',
      time: '3 hours ago',
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* ----------------- TOP BANNER: ROLE-BASED WELCOME & JUMP BAR ----------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0 ${
            isSuperAdmin
              ? 'bg-purple-600 shadow-purple-600/20'
              : isDeptAdmin
              ? 'bg-blue-600 shadow-blue-600/20'
              : isProjectManager
              ? 'bg-emerald-600 shadow-emerald-600/20'
              : 'bg-cyan-600 shadow-cyan-600/20'
          }`}>
            {isSuperAdmin && <Crown className="w-5 h-5" />}
            {isDeptAdmin && <Building2 className="w-5 h-5" />}
            {isProjectManager && <CheckCircle2 className="w-5 h-5" />}
            {isCitizen && <Globe className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isSuperAdmin
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  : isDeptAdmin
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : isProjectManager
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
              }`}>
                {user?.role?.replace('_', ' ') || 'OFFICER'}
              </span>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                {isSuperAdmin && 'Super Admin Command Center: Full System Governance'}
                {isDeptAdmin && `Department Command Center: ${user?.department?.name || 'Ministry Level'}`}
                {isProjectManager && 'Project Manager Workspace: Track & Execute Assigned Infrastructure'}
                {isCitizen && 'Citizen Portal: Stay Informed, Inspect Infrastructure & Raise Concerns'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Welcome back, <strong>{user?.name}</strong>. Authenticated with verified role permissions.
            </p>
          </div>
        </div>

        {/* Role Quick Links Pill Strip */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {isSuperAdmin && (
            <>
              <button
                onClick={() => navigate('/users')}
                className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" /> User Governance
              </button>
              <button
                onClick={() => navigate('/approvals')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" /> Approvals
              </button>
              <button
                onClick={() => navigate('/audit-logs')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" /> Audit Logs
              </button>
            </>
          )}

          {isDeptAdmin && (
            <>
              <button
                onClick={() => navigate('/approvals')}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" /> Review Approvals
              </button>
              <button
                onClick={() => navigate('/users')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" /> Assign PMs
              </button>
              <button
                onClick={() => navigate('/risks')}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Delay Alerts
              </button>
            </>
          )}

          {isProjectManager && (
            <>
              <button
                onClick={() => navigate('/milestones')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Milestones & Gantt
              </button>
              <button
                onClick={() => navigate('/budget')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FolderKanban className="w-3.5 h-3.5" /> Budget & Spend
              </button>
              <button
                onClick={() => navigate('/risks')}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Raise Alert
              </button>
            </>
          )}

          {isCitizen && (
            <button
              onClick={() => navigate('/citizen')}
              className="px-4 py-2 rounded-xl bg-[#1A73E8] text-white hover:bg-blue-700 text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" /> Open Citizen Portal
            </button>
          )}
        </div>
      </div>

      {/* ----------------- ROW 1: HERO BANNER + QUICK ACTIONS ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Hero Welcome Banner (9 cols) - Full uncropped official banner */}
        <div className="lg:col-span-9 bg-gradient-to-r from-[#F4F8FE] via-[#EBF3FE] to-[#CBE4F9] dark:from-[#0B1527] dark:via-[#0F1C33] dark:to-[#132442] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden relative flex items-center justify-center min-h-[160px] sm:min-h-[175px]">
          <img
            src="/assets/dashboard-hero-banner.png"
            alt="Welcome to ProjectSetu - Building a More Connected and Efficient India"
            className="w-full h-full object-contain object-center select-none dark:brightness-[0.92]"
          />
        </div>

        {/* Quick Actions (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#0F223D] dark:text-slate-100 mb-3">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Sanction Project (Admins only) or Track Projects (PMs) */}
            {canSanctionProjects ? (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="bg-[#1A73E8] hover:bg-blue-600 text-white rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Sanction Project</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/projects')}
                className="bg-[#1A73E8] hover:bg-blue-600 text-white rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Track Projects</span>
              </button>
            )}

            {/* 2. Generate Report */}
            <button
              onClick={() => navigate('/reports')}
              className="bg-[#EBF5FF] dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#0284C7] dark:text-blue-300 rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-bold border border-blue-100 dark:border-blue-900/60 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Generate Report</span>
            </button>

            {/* 3. View Map */}
            <button
              onClick={() => navigate('/map')}
              className="bg-[#E8F8F0] dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-[#0D9488] dark:text-emerald-300 rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-bold border border-emerald-100 dark:border-emerald-900/60 transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>View Map</span>
            </button>

            {/* 4. AI Assistant */}
            <button
              onClick={() => navigate('/ai-insights')}
              className="bg-[#FFF8EB] dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-[#D97706] dark:text-amber-300 rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-bold border border-amber-100 dark:border-amber-900/60 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </button>

            {/* 5. Project Grievance / Complain - Directly accessible for Citizens & Stakeholders */}
            <button
              onClick={() => navigate('/complaints')}
              className="col-span-2 bg-[#FFF1F2] dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-[#E11D48] dark:text-rose-300 rounded-xl py-2 px-3 flex items-center justify-center gap-2 text-xs font-bold border border-rose-200/80 dark:border-rose-900/60 transition-all cursor-pointer shadow-2xs"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>File Project Grievance / Complain</span>
            </button>
          </div>
        </div>
      </div>

      {/* ----------------- ROW 2: 8 METRIC KPI CARDS ----------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Total Projects */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FolderKanban className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500">Total Projects</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 leading-none">21</span>
              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                ↑ 12%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Across 5 Ministries</span>
          </div>
        </div>

        {/* 2. Active Projects */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500">Active Projects</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 leading-none">17</span>
              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                ↑ 6%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Under execution</span>
          </div>
        </div>

        {/* 3. Completed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500">Completed</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 leading-none">2</span>
              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                ↑ 100%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Commissioned</span>
          </div>
        </div>

        {/* 4. Delayed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500">Delayed</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 leading-none">2</span>
              <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                ↑ 0%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Critical path</span>
          </div>
        </div>

        {/* 5. High Risk */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500">High Risk</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 leading-none">4</span>
              <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 px-1 py-0.2 rounded">
                ↑ 33%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Score ≥ 61</span>
          </div>
        </div>

        {/* 6. Sanctioned Outlay */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs">
              ₹
            </div>
            <span className="text-[10px] font-bold text-slate-500">Sanctioned Outlay</span>
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-lg font-black text-slate-900 leading-none">₹8327.0 Cr</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Total outlay</span>
          </div>
        </div>

        {/* 7. Utilized */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
              ₹
            </div>
            <span className="text-[10px] font-bold text-slate-500">Utilized</span>
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-lg font-black text-slate-900 leading-none">₹5512.0 Cr</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">66.2% burn rate</span>
          </div>
        </div>

        {/* 8. Health Index */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <HeartPulse className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-500">Health Index</span>
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-xl font-black text-slate-900 leading-none">61/100</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Composite rating</span>
          </div>
        </div>
      </div>

      {/* ----------------- ROW 3: THREE VISUAL ANALYTICS CHARTS ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: Project Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#1A73E8]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#0F223D]">
                Project Status Distribution
              </h3>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Total: 21</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            {/* Donut Chart with Centered Number */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 leading-none">21</span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">Projects</span>
              </div>
            </div>

            {/* Legend on Right */}
            <div className="flex-1 pl-4 space-y-2.5">
              {statusChartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-[11px]">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2: Sanctioned vs Utilized Outlay */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 text-[#1A73E8] font-black text-sm flex items-center justify-center">₹</span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0F223D]">
                  Sanctioned vs Utilized Outlay
                </h3>
                <p className="text-[10px] text-slate-400">Amounts shown in ₹ Crore</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#D97706] bg-amber-50 px-2 py-0.5 rounded-md">
              66.2% Spent
            </span>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outlayData} margin={{ top: 22, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  domain={[0, 10000]}
                  ticks={[0, 2500, 5000, 7500, 10000]}
                  tickLine={false}
                  axisLine={false}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={44}>
                  <LabelList
                    dataKey="displayValue"
                    position="top"
                    fill="#0F223D"
                    fontSize={11}
                    fontWeight={700}
                    offset={5}
                  />
                  {outlayData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Project Health Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#1A73E8]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#0F223D]">
                Project Health Overview
              </h3>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Risk Severity Tiers</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            {/* Donut Chart with Centered Number */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {healthChartData.map((entry, index) => (
                      <Cell key={`health-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 leading-none">21</span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">Projects</span>
              </div>
            </div>

            {/* Legend on Right */}
            <div className="flex-1 pl-4 space-y-2.5">
              {healthChartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-[11px]">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- ROW 4: BOTTOM THREE FUNCTIONAL PANELS ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Panel 1: Department Performance Index (4.5 cols / 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1A73E8]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#0F223D]">
                  Department Performance Index
                </h3>
              </div>
              <button
                onClick={() => navigate('/departments')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Rankings</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-4">
              Average physical progress vs completion rate (%)
            </p>

            {/* Progress Bars */}
            <div className="space-y-3.5">
              {departmentPerformance.map((d) => (
                <div key={d.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-700 truncate max-w-[210px]">
                      {d.name}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{d.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${d.progress}%`, backgroundColor: d.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 2: Priority Projects Progress vs Risk (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-[#1A73E8]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#0F223D]">
                  Priority Projects Progress vs Risk
                </h3>
              </div>
              <button
                onClick={() => navigate('/projects')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-3">
              Top monitored projects with real-time status
            </p>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="pb-2 font-bold">Project Name</th>
                    <th className="pb-2 px-2 font-bold">Progress</th>
                    <th className="pb-2 px-2 font-bold">Risk</th>
                    <th className="pb-2 text-right font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-[11px]">
                  {priorityProjects.map((p) => (
                    <tr key={p.name} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800 truncate max-w-[150px]">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-2 font-bold text-slate-700">
                        {p.progress}%
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${p.riskColor}`} />
                          <span className="text-slate-600 text-[10px]">{p.risk}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${p.statusClass}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel 3: Live Activity Feed (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1A73E8]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#0F223D]">
                  Live Activity Feed
                </h3>
              </div>
              <button
                onClick={() => navigate('/notifications')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Feed List with Connected Timeline */}
            <div className="mt-3 space-y-3.5">
              {activityFeed.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 relative">
                  {/* Indicator Dot */}
                  <div className="mt-1 flex flex-col items-center">
                    <span className={`w-2 h-2 rounded-full ${item.color} shadow-2xs shrink-0`} />
                  </div>
                  {/* Content Stack */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 leading-tight truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                  {/* Timestamp */}
                  <span className="text-[9px] text-slate-400 whitespace-nowrap shrink-0">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for creating a new project */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};
