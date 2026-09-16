import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Search,
  MapPin,
  AlertOctagon,
  FileText,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Send,
  Download,
  Filter,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  Camera,
} from 'lucide-react';
import { publicApi } from '../api/publicApi';
import { departmentApi } from '../api/departmentApi';
import { Project, Department, DocumentItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ProjectMapComponent } from '../components/map/ProjectMapComponent';
import { getDocumentUrl } from '../utils/formatters';

export const CitizenPortal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'map' | 'submit' | 'track' | 'documents'>('projects');

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Grievance submission form
  const [formData, setFormData] = useState({
    projectId: '',
    complainantName: '',
    complainantEmail: '',
    subject: '',
    category: 'CONSTRUCTION_DELAY',
    description: '',
    isAnonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{ trackingId: string; message: string } | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Track Grievance state
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Public Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  // Selected Project detail modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const [pRes, dRes] = await Promise.all([
        publicApi.listProjects({
          search: search.trim() || undefined,
          departmentId: selectedDept !== 'ALL' ? selectedDept : undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          limit: 100,
        }),
        departmentApi.listDepartments(),
      ]);
      setProjects(pRes.data);
      setDepartments(dRes);
      if (pRes.data.length > 0 && !formData.projectId) {
        setFormData((prev) => ({ ...prev, projectId: pRes.data[0].id }));
      }
    } catch (e) {
      console.error('Failed to load public data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      setDocsLoading(true);
      const docs = await publicApi.listDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error('Failed to load documents:', e);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [selectedDept, selectedStatus]);

  useEffect(() => {
    if (activeTab === 'documents') {
      loadDocuments();
    }
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProjects();
  };

  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const res = await publicApi.submitGrievance(formData);
      setSubmitSuccess({ trackingId: res.trackingId, message: res.message });
      setFormData({
        projectId: projects[0]?.id || '',
        complainantName: '',
        complainantEmail: '',
        subject: '',
        category: 'CONSTRUCTION_DELAY',
        description: '',
        isAnonymous: false,
      });
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to submit grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingIdInput.trim()) return;
    setTrackingLoading(true);
    setTrackingError('');
    setTrackingResult(null);
    try {
      const result = await publicApi.trackGrievance(trackingIdInput.trim());
      setTrackingResult(result);
    } catch (err: any) {
      setTrackingError(err.response?.data?.message || 'No record found with this reference tracking number.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">In Progress</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">Completed</span>;
      case 'DELAYED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">Delayed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">Sanctioned</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F223D] via-[#1A365D] to-[#0A192F] p-6 sm:p-8 text-white shadow-xl border border-slate-700/50">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#FF9933] via-white to-[#138808] text-slate-950 shadow-md">
              Jan Samvad & Citizen Transparency
            </span>
            <span className="text-xs text-blue-200">Government of India • ProjectSetu</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Citizen Public Monitoring & Grievance Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Track nation-building infrastructure developments across India in real-time, inspect permitted public documents, and submit feedback or grievances with direct reference tracking.
          </p>

          {/* Saffron White Green Line */}
          <div className="w-32 h-1 rounded-full flex overflow-hidden shadow-sm pt-1">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-white" />
            <div className="w-1/3 bg-[#138808]" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {[
          { key: 'projects', label: 'Explore Public Projects', icon: Globe },
          { key: 'map', label: 'All-India GIS Map', icon: MapPin },
          { key: 'submit', label: 'Submit Grievance / Feedback', icon: AlertOctagon },
          { key: 'track', label: 'Track by Reference No.', icon: Search },
          { key: 'documents', label: 'Public Documents & Circulars', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1A73E8] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXPLORE PUBLIC PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <form onSubmit={handleSearch} className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects by name, city, highway..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none max-w-[220px] truncate"
              >
                <option value="ALL">All Ministries</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="DELAYED">Delayed</option>
              </select>
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <LoadingSpinner message="Aggregating public infrastructure telemetries..." />
          ) : projects.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No public projects match criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try clearing filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate">
                        {p.department?.code || 'Government Project'}
                      </span>
                      {getStatusBadge(p.status)}
                    </div>

                    <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2">
                      {p.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {p.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Physical Progress</span>
                        <span className="text-blue-600 dark:text-blue-400">{p.progressPercentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${p.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Target: {new Date(p.expectedCompletionDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                      <span>{p._count?.milestones || 0} Milestones</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <button
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, projectId: p.id, subject: `Feedback for ${p.name}` }));
                        setActiveTab('submit');
                      }}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" /> Raise Concern
                    </button>
                    <button
                      onClick={() => setSelectedProject(p)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GIS MAP */}
      {activeTab === 'map' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              All-India Public GIS Infrastructure Map
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive map pins representing key national corridors, bridges, smart cities, and healthcare infrastructure.
            </p>
          </div>
          <div className="h-[550px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <ProjectMapComponent projects={projects} />
          </div>
        </div>
      )}

      {/* TAB 3: SUBMIT GRIEVANCE */}
      {activeTab === 'submit' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Citizen Grievance & Vigilance Submission
              </h2>
              <p className="text-xs text-slate-500">
                Submit observations, safety hazards, quality concerns, or delays directly to project authorities.
              </p>
            </div>
          </div>

          {/* Quick Launch Camera & GPS Reporter */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Live Photo & GPS Reporting</h4>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  Capture on-site photos, auto-detect coordinates & find the nearest project.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/report-issue')}
              className="px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-black shrink-0 transition-colors shadow-xs cursor-pointer"
            >
              Open Camera Reporter
            </button>
          </div>

          {submitSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                {submitSuccess.message}
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Your Reference Tracking ID</span>
                  <p className="font-mono text-base font-black text-blue-600 dark:text-blue-400">{submitSuccess.trackingId}</p>
                </div>
                <button
                  onClick={() => {
                    setTrackingIdInput(submitSuccess.trackingId);
                    setActiveTab('track');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  Track Now
                </button>
              </div>
            </div>
          )}

          {submitError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs font-semibold">
              {submitError}
            </div>
          )}

          <form onSubmit={handleGrievanceSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Infrastructure Project *
              </label>
              <select
                required
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.department?.code || 'Govt'}) - {p.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name {!formData.isAnonymous && '*'}
                </label>
                <input
                  type="text"
                  disabled={formData.isAnonymous}
                  required={!formData.isAnonymous}
                  placeholder="e.g. Rajeshwar Rao"
                  value={formData.complainantName}
                  onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-40 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Email Address {!formData.isAnonymous && '*'}
                </label>
                <input
                  type="email"
                  disabled={formData.isAnonymous}
                  required={!formData.isAnonymous}
                  placeholder="e.g. rajeshwar@gmail.com"
                  value={formData.complainantEmail}
                  onChange={(e) => setFormData({ ...formData, complainantEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-40 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <label htmlFor="isAnonymous" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Submit anonymously (Identity will not be disclosed to contractor or authorities)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Grievance Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="CONSTRUCTION_DELAY">Construction Delay / Stoppage</option>
                  <option value="QUALITY_DEFECT">Workmanship / Quality Defect</option>
                  <option value="SAFETY_HAZARD">Public Safety Hazard</option>
                  <option value="ENVIRONMENTAL_VIOLATION">Environmental Pollution / Damage</option>
                  <option value="FINANCIAL_MISUSE">Suspected Misuse / Irregularity</option>
                  <option value="OTHER">General Grievance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Open trench left unguarded on Sector 4 highway"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Description & Location Landmark *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Provide exact landmark, dates observed, impact on public, and any contractor details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting with Tracking ID...' : 'Submit Grievance to Ministry'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: TRACK BY REFERENCE NUMBER */}
      {activeTab === 'track' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-4">
            <div className="text-center max-w-md mx-auto space-y-1.5">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Live Grievance Tracking Engine
              </h2>
              <p className="text-xs text-slate-500">
                Enter your reference number (e.g. <strong>SETU-GRV-829104</strong>) to view status, inspection notes, and timeline.
              </p>
            </div>

            <form onSubmit={handleTrackLookup} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter Tracking ID (e.g. SETU-GRV-829104)"
                  value={trackingIdInput}
                  onChange={(e) => setTrackingIdInput(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer shrink-0"
              >
                {trackingLoading ? 'Searching...' : 'Track Status'}
              </button>
            </form>

            {/* Quick Demo ID suggestion buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
              <span>Try sample IDs:</span>
              {['SETU-GRV-829104', 'SETU-GRV-551029', 'SETU-GRV-391482'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTrackingIdInput(id);
                    publicApi.trackGrievance(id).then(setTrackingResult).catch(() => {});
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 font-mono font-bold transition-colors cursor-pointer"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {trackingError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-semibold text-center">
              {trackingError}
            </div>
          )}

          {trackingResult && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Reference Number</span>
                  <p className="font-mono text-base font-black text-blue-600 dark:text-blue-400">{trackingResult.trackingId}</p>
                </div>
                <div>{getStatusBadge(trackingResult.status)}</div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{trackingResult.subject}</h3>
                <p className="text-xs text-slate-500">
                  Category: <strong>{trackingResult.category}</strong> | Project:{' '}
                  <strong>{trackingResult.project?.name} ({trackingResult.project?.department?.code})</strong>
                </p>
              </div>

              {/* Resolution Timeline */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> Resolution Telemetry & Findings
                </h4>

                <div className="text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Grievance Registered & Acknowledged</p>
                      <p className="text-[11px] text-slate-400">{new Date(trackingResult.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {trackingResult.resolutionNotes && (
                    <div className="flex items-start gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">Department Action Notes</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{trackingResult.resolutionNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PUBLIC DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Public Documents & Sanction Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified public notifications, Environmental Impact Assessments (EIA), and Detailed Project Reports (DPR).
            </p>
          </div>

          {docsLoading ? (
            <LoadingSpinner message="Fetching verified public records..." />
          ) : documents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No public documents uploaded yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{doc.project?.name} • {doc.category}</p>
                    </div>
                  </div>

                  <a
                    href={getDocumentUrl(doc.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {selectedProject.department?.name}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">{selectedProject.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {selectedProject.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedProject.description}
            </p>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span>Progress: {selectedProject.progressPercentage}%</span>
                <span>Status: {selectedProject.status}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${selectedProject.progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
