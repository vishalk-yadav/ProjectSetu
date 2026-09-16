import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, AlertOctagon, Info, Filter } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');

  const filtered = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.type === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F223D] font-heading tracking-tight">
            Notification Center & Smart Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time threshold alerts, overdue milestones, budget warnings, and AI anomaly triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#1A73E8] text-xs font-bold border border-slate-200 shadow-2xs transition-colors"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              filter === f
                ? 'border-[#1A73E8] text-[#1A73E8] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {f} ALERTS
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No notifications matching the selected filter.
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer hover:bg-slate-50/70 ${
                  !n.isRead ? 'bg-blue-50/40 border-l-4 border-[#1A73E8]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    n.type === 'CRITICAL'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200/80'
                      : n.type === 'WARNING'
                      ? 'bg-amber-50 text-amber-600 border border-amber-200/80'
                      : 'bg-blue-50 text-[#1A73E8] border border-blue-200/80'
                  }`}>
                    {n.type === 'CRITICAL' ? (
                      <AlertOctagon className="w-5 h-5" />
                    ) : n.type === 'WARNING' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#0F223D]">{n.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        n.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {n.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block mt-1.5">{formatDate(n.createdAt)}</span>
                  </div>
                </div>

                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8] shrink-0 mt-2 shadow-2xs" title="Unread" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
