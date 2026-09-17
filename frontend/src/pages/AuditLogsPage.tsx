import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  User,
  Activity,
  Calendar,
  RefreshCw,
  FolderKanban,
  CheckSquare,
  FileText,
  Sliders,
  AlertOctagon,
  Eye,
} from 'lucide-react';
import { auditApi, AuditLogResponse } from '../api/auditApi';
import { AuditLogItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';

export const AuditLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [res, statsData] = await Promise.all([
        auditApi.listLogs({
          action: actionFilter !== 'ALL' ? actionFilter : undefined,
          entityType: entityFilter !== 'ALL' ? entityFilter : undefined,
          search: search.trim() || undefined,
          page,
          limit: 30,
        }),
        auditApi.getStats(),
      ]);
      setLogs(res.data);
      setPagination(res.pagination);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actionFilter, entityFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE') || action.includes('SUBMIT')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">{action}</span>;
    }
    if (action.includes('APPROVE') || action.includes('ACTIVATE')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">{action}</span>;
    }
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('DEACTIVATE')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">{action}</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">{action}</span>;
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'USER':
        return <User className="w-3.5 h-3.5 text-indigo-500" />;
      case 'PROJECT':
        return <FolderKanban className="w-3.5 h-3.5 text-blue-500" />;
      case 'APPROVAL':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case 'DOCUMENT':
        return <FileText className="w-3.5 h-3.5 text-amber-500" />;
      case 'COMPLAINT':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />;
      case 'SYSTEM_SETTING':
        return <Sliders className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('auditLogs.title', 'System Audit Trails & Governance Logs')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('auditLogs.subtitle', 'Immutable telemetry record of administrative changes, approvals, user actions, and project modifications.')}
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> {t('common.refresh', 'Refresh Audit Trail')}
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-500">{t('auditLogs.title', 'Total Audit Events')}</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">{t('nav.userManagement', 'User Operations')}</span>
            <p className="text-2xl font-black text-indigo-900 dark:text-indigo-300 mt-1">{stats.userChanges}</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/60 shadow-xs">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{t('nav.myProjects', 'Project Telemetry')}</span>
            <p className="text-2xl font-black text-blue-900 dark:text-blue-300 mt-1">{stats.projectChanges}</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{t('approvals.title', 'Approval Actions')}</span>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-300 mt-1">{stats.approvals}</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/60 shadow-xs">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">{t('nav.trackGrievances', 'Grievance Actions')}</span>
            <p className="text-2xl font-black text-rose-900 dark:text-rose-300 mt-1">{stats.grievances}</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('users.searchPlaceholder', 'Search details, user email, action...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">{t('auditLogs.allEntities', 'All Entity Types')}</option>
            <option value="USER">User Governance</option>
            <option value="PROJECT">Project Operations</option>
            <option value="APPROVAL">Workflow Approvals</option>
            <option value="DOCUMENT">Document Records</option>
            <option value="COMPLAINT">Grievances</option>
            <option value="SYSTEM_SETTING">System Settings</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <LoadingSpinner message={t('common.loading', 'Querying tamper-proof audit trail...')} />
      ) : logs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('common.noData', 'No audit records found')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('projects.noProjects', 'Adjust your search or filter parameters to explore history.')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">{t('auditLogs.timestamp', 'Timestamp')}</th>
                  <th className="px-4 py-3.5">{t('auditLogs.user', 'Actor / Officer')}</th>
                  <th className="px-4 py-3.5">{t('auditLogs.action', 'Action Type')}</th>
                  <th className="px-4 py-3.5">{t('auditLogs.entity', 'Entity')}</th>
                  <th className="px-4 py-3.5">{t('auditLogs.details', 'Details')}</th>
                  <th className="px-4 py-3.5">{t('auditLogs.ipAddress', 'IP Address')}</th>
                  <th className="px-4 py-3.5 text-right">{t('common.action', 'Inspect')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{log.userName || 'System'}</p>
                        <p className="text-[10px] text-slate-400">{log.userEmail || 'system@projectsetu.gov.in'} ({log.role || 'SYSTEM'})</p>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">{getActionBadge(log.action)}</td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {getEntityIcon(log.entityType)}
                        {log.entityType}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors cursor-pointer"
                        title={t('common.viewDetails', 'View Full Audit Payload')}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} events)</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  {t('common.previous', 'Previous')}
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  {t('common.next', 'Next')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={t('auditLogs.details', 'Audit Event Details')}
      >
        {selectedLog && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                {getActionBadge(selectedLog.action)}
                <span className="font-mono text-slate-400 text-[11px]">{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{t('auditLogs.user', 'Actor')}: {selectedLog.userName} ({selectedLog.userEmail})</p>
              <p className="text-slate-500">{t('users.userRole', 'Role')}: <strong>{selectedLog.role}</strong> | {t('auditLogs.entity', 'Entity')}: <strong>{selectedLog.entityType}</strong> {selectedLog.entityId ? `[${selectedLog.entityId}]` : ''}</p>
              <p className="text-slate-500">{t('auditLogs.ipAddress', 'Origin IP')}: <strong className="font-mono">{selectedLog.ipAddress}</strong></p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('auditLogs.details', 'Detailed Activity Description')}
              </label>
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs whitespace-pre-wrap">
                {selectedLog.details}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
              >
                {t('common.cancel', 'Close')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
