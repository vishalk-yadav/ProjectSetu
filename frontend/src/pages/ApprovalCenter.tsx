import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  FolderKanban,
  FileText,
  User,
  AlertCircle,
  RefreshCw,
  Eye,
  Send,
} from 'lucide-react';
import { approvalApi } from '../api/approvalApi';
import { ApprovalRequestItem, ApprovalType } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';

export const ApprovalCenter: React.FC = () => {
  const { t } = useTranslation();
  const { user: currentUser, isSuperAdmin, isDeptAdmin, isProjectManager, canApproveRequests } = useAuth();

  const [approvals, setApprovals] = useState<ApprovalRequestItem[]>([]);
  const [stats, setStats] = useState<{ pending: number; approved: number; rejected: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Review modal state
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestItem | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [approvalsData, statsData] = await Promise.all([
        approvalApi.listApprovals({
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          type: typeFilter !== 'ALL' ? typeFilter : undefined,
        }),
        approvalApi.getStats(),
      ]);
      setApprovals(approvalsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter]);

  const handleOpenReview = (request: ApprovalRequestItem) => {
    setSelectedRequest(request);
    setReviewNotes('');
    setReviewError('');
    setReviewModalOpen(true);
  };

  const handleReviewAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    setReviewError('');
    try {
      await approvalApi.reviewApproval(selectedRequest.id, action, reviewNotes.trim() || undefined);
      setReviewModalOpen(false);
      setSuccessMessage(`Request successfully ${action === 'APPROVE' ? 'Approved' : 'Rejected'}. Changes have been applied to project data.`);
      setTimeout(() => setSuccessMessage(''), 5000);
      loadData();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || err.message || 'Review action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadge = (type: ApprovalType) => {
    switch (type) {
      case 'PROGRESS_UPDATE':
        return <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">Progress Update</span>;
      case 'MILESTONE_STATUS':
        return <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">Milestone Status</span>;
      case 'BUDGET_REVISION':
        return <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">Budget Revision</span>;
      case 'DOCUMENT_UPLOAD':
        return <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">Document Upload</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{type}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" /> Pending Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const parsePayload = (payloadString: string) => {
    try {
      return JSON.parse(payloadString);
    } catch {
      return payloadString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('approvals.title', canApproveRequests ? 'Department Approval Command' : 'My Project Change Requests')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('approvals.subtitle', 'Multi-tiered sanctioning pipeline for milestones, budget escalations, and project DPRs.')}
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> {t('common.refresh', 'Refresh Queue')}
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{t('dashboard.kpi.totalProjects', 'Total Requests')}</span>
              <CheckSquare className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{stats.total}</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{t('approvals.pendingTab', 'Pending Review')}</span>
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            </div>
            <p className="text-2xl font-black text-amber-900 dark:text-amber-300 mt-1.5">{stats.pending}</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{t('approvals.approvedTab', 'Approved')}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-300 mt-1.5">{stats.approved}</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/60 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">{t('approvals.rejectedTab', 'Rejected')}</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-900 dark:text-rose-300 mt-1.5">{stats.rejected}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st === 'ALL' ? t('common.all', 'All Requests') : st === 'PENDING' ? t('approvals.pendingTab', 'Pending') : st === 'APPROVED' ? t('approvals.approvedTab', 'Approved') : t('approvals.rejectedTab', 'Rejected')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">{t('approvals.approvalType', 'All Request Types')}</option>
            <option value="PROGRESS_UPDATE">Progress Update</option>
            <option value="MILESTONE_STATUS">Milestone Status</option>
            <option value="BUDGET_REVISION">Budget Revision</option>
            <option value="DOCUMENT_UPLOAD">Document Upload</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <LoadingSpinner message={t('common.loading', 'Loading workflow requests and audit statuses...')} />
      ) : approvals.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('approvals.noPending', 'No approval requests')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('projects.noProjects', 'There are no requests matching the selected filter criteria.')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((req) => {
            const payload = parsePayload(req.payload);
            const isPending = req.status === 'PENDING';

            return (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(req.type)}
                    {getStatusBadge(req.status)}
                    <span className="text-[11px] text-slate-400">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{req.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{req.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <FolderKanban className="w-3.5 h-3.5 text-blue-500" />
                      {req.project?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {t('approvals.submittedBy', 'Requested by')}: <strong className="text-slate-800 dark:text-slate-200">{req.requestedBy?.name}</strong>
                    </span>
                  </div>

                  {/* Review remarks if already processed */}
                  {req.reviewNotes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{t('approvals.decisionNotes', 'Reviewer Remarks')} ({req.reviewedBy?.name || 'Administrator'}):</span>{' '}
                      <span className="text-slate-600 dark:text-slate-400">{req.reviewNotes}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {canApproveRequests && isPending ? (
                    <button
                      onClick={() => handleOpenReview(req)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('approvals.reviewBtn', 'Review & Action')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenReview(req)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> {t('common.viewDetails', 'View Details')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review & Details Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={selectedRequest?.status === 'PENDING' && canApproveRequests ? t('approvals.reviewModalTitle', 'Review Approval Request') : t('approvals.reviewModalTitle', 'Approval Request Details')}
      >
        {selectedRequest && (
          <div className="space-y-4">
            {reviewError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs">
                {reviewError}
              </div>
            )}

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                {getTypeBadge(selectedRequest.type)}
                {getStatusBadge(selectedRequest.status)}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedRequest.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">{selectedRequest.description}</p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                <p>{t('dashboard.panels.projectName', 'Project')}: <strong>{selectedRequest.project?.name}</strong></p>
                <p>{t('approvals.submittedBy', 'Submitted by')}: <strong>{selectedRequest.requestedBy?.name} ({selectedRequest.requestedBy?.email})</strong></p>
                <p>{t('auditLogs.timestamp', 'Submitted Date')}: {new Date(selectedRequest.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Change Payload Inspector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('auditLogs.details', 'Requested Data Modification')}
              </label>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto">
                {JSON.stringify(parsePayload(selectedRequest.payload), null, 2)}
              </pre>
            </div>

            {/* Review Remarks Input (if pending & authority) */}
            {selectedRequest.status === 'PENDING' && canApproveRequests ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('approvals.decisionNotes', 'Official Remarks / Review Feedback')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t('approvals.decisionNotesPlaceholder', 'Enter approval conditions, verification notes, or reason for rejection...')}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            ) : selectedRequest.reviewNotes ? (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                <p className="font-bold text-slate-700 dark:text-slate-300">{t('approvals.decisionNotes', 'Authority Remarks')}:</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedRequest.reviewNotes}</p>
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {t('common.cancel', 'Close')}
              </button>

              {selectedRequest.status === 'PENDING' && canApproveRequests && (
                <>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleReviewAction('REJECT')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {t('approvals.rejectBtn', 'Reject Request')}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleReviewAction('APPROVE')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {t('approvals.approveBtn', 'Approve & Apply Changes')}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
