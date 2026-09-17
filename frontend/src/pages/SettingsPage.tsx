import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Landmark,
  ShieldCheck,
  Database,
  Server,
  Cpu,
  Key,
  UserCheck,
  Sliders,
  Sparkles,
  Bell,
  Save,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { systemSettingApi } from '../api/systemSettingApi';
import { SystemSettingItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState<SystemSettingItem[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await systemSettingApi.getSettings();
      setSettings(res.data);
      setSettingsMap(res.map);
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettingsMap((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setSaving(true);
    try {
      const payload = Object.entries(settingsMap).map(([key, value]) => ({
        key,
        value,
      }));
      await systemSettingApi.updateSettings(payload);
      setSuccessMessage(t('settings.savedSuccess'));
      setTimeout(() => setSuccessMessage(''), 4000);
      loadSettings();
    } catch (e) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('settings.title')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('settings.subtitle')}
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={loadSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> {t('common.refresh')}
          </button>
        )}
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Super Admin Config Form */}
      {isSuperAdmin && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* AI Settings Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI & Predictive Engine Calibration</h3>
                <p className="text-[11px] text-slate-500">Tune composite risk weights, anomaly thresholds, and AI executive summaries</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Delay Risk Weight (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settingsMap['AI_RISK_DELAY_WEIGHT'] || '35'}
                  onChange={(e) => handleChange('AI_RISK_DELAY_WEIGHT', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400">Milestone schedule slippage factor in 0-100 risk score</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Budget Overrun Weight (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settingsMap['AI_RISK_BUDGET_WEIGHT'] || '30'}
                  onChange={(e) => handleChange('AI_RISK_BUDGET_WEIGHT', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400">CPI variance & cost overrun factor in risk score</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Staleness Anomaly Threshold (Days)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={settingsMap['AI_ANOMALY_STALENESS_DAYS'] || '30'}
                  onChange={(e) => handleChange('AI_ANOMALY_STALENESS_DAYS', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400">Days without progress update before anomaly flag</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Citizen Grievance Escalation (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settingsMap['GRIEVANCE_ESCALATION_DAYS'] || '14'}
                  onChange={(e) => handleChange('GRIEVANCE_ESCALATION_DAYS', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400">Unresolved complaints escalated to Vigilance cell</p>
              </div>
            </div>
          </div>

          {/* Notifications & Platform Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Alert Dispatch & Public Access Controls</h3>
                <p className="text-[11px] text-slate-500">Configure email/SMS notifications and portal access policies</p>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-1">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsMap['AUTO_NOTIFY_DEPARTMENT_HEADS'] === 'true'}
                  onChange={(e) => handleChange('AUTO_NOTIFY_DEPARTMENT_HEADS', e.target.checked ? 'true' : 'false')}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Auto-Dispatch Critical Alerts to Ministry Heads</span>
                  <p className="text-[11px] text-slate-400">Trigger instant priority notifications when project risk score exceeds 80</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsMap['CITIZEN_PORTAL_PUBLIC_ACCESS'] === 'true'}
                  onChange={(e) => handleChange('CITIZEN_PORTAL_PUBLIC_ACCESS', e.target.checked ? 'true' : 'false')}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Citizen Transparency Portal Enabled</span>
                  <p className="text-[11px] text-slate-400">Allow public visitors to track sanctioned infrastructure milestones and file grievances</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : t('settings.saveSettings')}
            </button>
          </div>
        </form>
      )}

      {/* User Session Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#1A73E8] border border-blue-100 dark:border-blue-900">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Officer Session</h3>
            <p className="text-[11px] text-slate-500">Authenticated governance identity profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 uppercase font-bold">{t('users.userName')}</span>
            <p className="text-slate-900 dark:text-white font-bold mt-0.5">{user?.name}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 uppercase font-bold">{t('users.userEmail')}</span>
            <p className="text-slate-900 dark:text-white font-bold mt-0.5">{user?.email}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 uppercase font-bold">{t('users.userRole')}</span>
            <p className="text-[#1A73E8] font-bold mt-0.5">{user?.role}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 uppercase font-bold">{t('users.accountStatus')}</span>
            <p className="text-emerald-600 font-bold mt-0.5">{t('users.active')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
