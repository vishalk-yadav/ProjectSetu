import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertOctagon,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Building2,
  FolderKanban,
  User,
  Calendar,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  MessageSquareWarning,
  ShieldCheck,
  X,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { complaintApi, ComplaintQueryParams, CreateComplaintPayload } from '../api/complaintApi';
import { projectApi } from '../api/projectApi';
import { Complaint, Project, ComplaintStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  CONSTRUCTION_DELAY: { label: 'Construction Delay', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60' },
  QUALITY_DEFECT: { label: 'Quality Defect', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60' },
  FINANCIAL_MISUSE: { label: 'Fund Misuse / Audit', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/60' },
  SAFETY_HAZARD: { label: 'Safety Hazard', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60' },
  ENVIRONMENTAL_VIOLATION: { label: 'Environmental Hazard', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60' },
  CITIZEN_GRIEVANCE: { label: 'Citizen Grievance', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60' },
  OTHER: { label: 'Other Concern', color: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
};

const SEVERITY_BADGES: Record<string, string> = {
  CRITICAL: 'bg-red-500 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-amber-500 text-white',
  LOW: 'bg-blue-500 text-white',
};

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; bg: string; icon: any }> = {
  PENDING: { label: 'Pending Review', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400', icon: Clock },
  IN_REVIEW: { label: 'Under Investigation', bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400', icon: AlertTriangle },
  RESOLVED: { label: 'Resolved / Closed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400', icon: CheckCircle2 },
  REJECTED: { label: 'Dismissed', bg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400', icon: XCircle },
};

export const Complaints: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({ total: 0, pending: 0, inReview: 0, resolved: 0, critical: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState(searchParams.get('projectId') || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(searchParams.get('new') === 'true');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Form State for new Complaint
  const [formProjectId, setFormProjectId] = useState(searchParams.get('projectId') || '');
  const [formSubject, setFormSubject] = useState('');
  const [formCategory, setFormCategory] = useState('CONSTRUCTION_DELAY');
  const [formSeverity, setFormSeverity] = useState('MEDIUM');
  const [formDescription, setFormDescription] = useState('');
  const [formIsAnonymous, setFormIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Status update state
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('IN_REVIEW');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [complaintsData, statsData, projectsRes] = await Promise.all([
        complaintApi.listComplaints({
          projectId: selectedProject !== 'ALL' ? selectedProject : undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          severity: selectedSeverity !== 'ALL' ? selectedSeverity : undefined,
          search: search || undefined,
        }),
        complaintApi.getStats(),
        projectApi.listProjects({ limit: 100 }),
      ]);
      setComplaints(complaintsData);
      setStats(statsData);
      setProjects(projectsRes.data || []);
      if (!formProjectId && projectsRes.data?.length > 0) {
        setFormProjectId(projectsRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load complaints data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [selectedProject, selectedStatus, selectedCategory, selectedSeverity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInitialData();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProjectId) {
      setFormError('Please select a project.');
      return;
    }
    if (!formSubject.trim()) {
      setFormError('Subject is required.');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Please provide a detailed grievance description.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      const payload: CreateComplaintPayload = {
        projectId: formProjectId,
        subject: formSubject.trim(),
        category: formCategory,
        severity: formSeverity,
        description: formDescription.trim(),
        isAnonymous: formIsAnonymous,
        complainantName: formIsAnonymous ? undefined : user?.name,
        complainantEmail: formIsAnonymous ? undefined : (user?.email || undefined),
      };

      await complaintApi.createComplaint(payload);
      setIsCreateOpen(false);
      // Reset form
      setFormSubject('');
      setFormDescription('');
      setFormSeverity('MEDIUM');
      setFormCategory('CONSTRUCTION_DELAY');
      setFormIsAnonymous(false);
      await fetchInitialData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setUpdatingStatus(true);
      await complaintApi.updateStatus(selectedComplaint.id, newStatus, resolutionNotes);
      setIsStatusModalOpen(false);
      setSelectedComplaint(null);
      setResolutionNotes('');
      await fetchInitialData();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-[#E11D48] border border-rose-200/80 dark:bg-rose-950/40 dark:border-rose-900/60 shadow-2xs">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-[#0F223D] dark:text-white font-heading tracking-tight">
              Project Grievance & Vigilance Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Centralized authority & citizen redressal channel for logging quality defects, schedule delays, safety hazards, and financial discrepancies across all national projects.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchInitialData()}
            className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-2xs transition-colors cursor-pointer"
            title="Refresh Complaints"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>File Project Grievance</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-[#0A1220] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Grievances</span>
          <p className="text-2xl font-black text-[#0F223D] dark:text-white mt-1">{stats.total || 0}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Recorded platform-wide</span>
        </div>
        <div className="bg-white dark:bg-[#0A1220] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Pending Inquiry</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pending || 0}</p>
          <span className="text-[10px] text-amber-600/80 mt-0.5 block">Awaiting preliminary review</span>
        </div>
        <div className="bg-white dark:bg-[#0A1220] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Under Investigation</span>
          <p className="text-2xl font-black text-[#1A73E8] dark:text-blue-400 mt-1">{stats.inReview || 0}</p>
          <span className="text-[10px] text-blue-600/80 mt-0.5 block">Field inspection underway</span>
        </div>
        <div className="bg-white dark:bg-[#0A1220] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Resolved / Closed</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.resolved || 0}</p>
          <span className="text-[10px] text-emerald-600/80 mt-0.5 block">Corrective action taken</span>
        </div>
        <div className="bg-white dark:bg-[#0A1220] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">High / Critical</span>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{stats.critical || 0}</p>
          <span className="text-[10px] text-red-600/80 mt-0.5 block">Immediate audit priority</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0A1220] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search grievance subject, description, complainant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInitialData()}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#E11D48] transition-colors"
            />
          </div>

          {/* Project Filter */}
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#E11D48] transition-colors appearance-none cursor-pointer"
            >
              <option value="ALL">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#E11D48] transition-colors appearance-none cursor-pointer"
            >
              <option value="ALL">All Grievance Categories</option>
              {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Severity Filter */}
          <div className="relative">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#E11D48] transition-colors appearance-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#E11D48] transition-colors appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="IN_REVIEW">Under Investigation</option>
              <option value="RESOLVED">Resolved / Closed</option>
              <option value="REJECTED">Dismissed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner message="Querying project vigilance registry..." />
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No Project Grievances Found"
          description="There are currently no recorded grievances matching your selected filters. Authorities and citizens can file a report anytime."
          actionLabel="File New Grievance"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {complaints.map((c) => {
            const catInfo = CATEGORY_MAP[c.category] || { label: c.category, color: 'bg-slate-50 text-slate-700 border-slate-200' };
            const statusInfo = STATUS_CONFIG[c.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-[#0A1220] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    {/* Header line: Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${SEVERITY_BADGES[c.severity] || 'bg-slate-500 text-white'}`}>
                        {c.severity}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${catInfo.color}`}>
                        {catInfo.label}
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${statusInfo.bg}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>

                    {/* Subject */}
                    <h3 className="text-sm sm:text-base font-bold text-[#0F223D] dark:text-white leading-snug">
                      {c.subject}
                    </h3>

                    {/* Project & Department reference */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1 font-semibold text-[#1A73E8] dark:text-blue-400">
                        <FolderKanban className="w-3.5 h-3.5 shrink-0" />
                        <span>{c.project?.name || 'Target Project'}</span>
                      </div>
                      {c.project?.department && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{c.project.department.name} ({c.project.department.code})</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      {c.description}
                    </p>

                    {/* Resolution Banner if resolved */}
                    {c.resolutionNotes && (
                      <div className="flex items-start gap-2 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 p-3 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                        <div>
                          <span className="font-bold">Official Resolution & Action: </span>
                          <span>{c.resolutionNotes}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metadata & Actions Column */}
                  <div className="flex md:flex-col items-end justify-between md:justify-start gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 justify-end">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-700 dark:text-slate-200">{c.complainantName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end text-[11px] text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(c.createdAt)}</span>
                      </div>
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider">
                        {c.complainantRole}
                      </span>
                    </div>

                    {/* Action button to update status */}
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setNewStatus(c.status);
                        setResolutionNotes(c.resolutionNotes || '');
                        setIsStatusModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-50/40 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-[#1A73E8]" />
                      <span>Update Status</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- FILE COMPLAINT MODAL ----------------- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0A1220] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-rose-50/70 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500 text-white shadow-2xs">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F223D] dark:text-white font-heading">
                    File Project Grievance / Vigilance Alert
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Log an official inquiry or complaint regarding public project execution.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Target Project Selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Target Sanctioned Project <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#E11D48]"
                >
                  <option value="">Select Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Grievance Category & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Grievance Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#E11D48]"
                  >
                    {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Severity Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#E11D48]"
                  >
                    <option value="CRITICAL">Critical (Life safety / Immediate stoppage)</option>
                    <option value="HIGH">High (Major delay / Substantial defect)</option>
                    <option value="MEDIUM">Medium (Moderate variance / Public inconvenience)</option>
                    <option value="LOW">Low (Minor procedural inquiry)</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Subject / Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Unreported bridge pier foundation delay at KM 114"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Detailed Findings & Specific Discrepancies <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="State the observed issues, specific milestone/location, estimated delay, physical deviations from DPR, or evidence of substandard materials..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#E11D48] leading-relaxed"
                />
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={formIsAnonymous}
                  onChange={(e) => setFormIsAnonymous(e.target.checked)}
                  className="rounded border-slate-300 text-[#E11D48] focus:ring-[#E11D48] cursor-pointer"
                />
                <label htmlFor="anonymousCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Submit as Anonymous Vigilance / Whistleblower Report
                </label>
              </div>

              {/* Footer action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-rose-700 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Submitting Grievance...' : 'Submit Grievance to Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- UPDATE STATUS MODAL ----------------- */}
      {isStatusModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0A1220] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1A73E8]" />
                <h3 className="text-base font-black text-[#0F223D] dark:text-white font-heading">
                  Update Grievance Status
                </h3>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Subject</span>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">
                  {selectedComplaint.subject}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Target Project: {selectedComplaint.project?.name}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Investigation / Resolution Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#1A73E8]"
                >
                  <option value="PENDING">Pending Review</option>
                  <option value="IN_REVIEW">Under Investigation</option>
                  <option value="RESOLVED">Resolved / Corrective Action Completed</option>
                  <option value="REJECTED">Dismissed / Inapplicable</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Official Audit Notes & Corrective Directives
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail the findings of the field inspection, contractor penalty or rectification memo issued, and handover confirmation..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-[#1A73E8] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {updatingStatus ? 'Saving Status...' : 'Save & Notify Officers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
