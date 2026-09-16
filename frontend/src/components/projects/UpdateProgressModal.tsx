import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Project } from '../../types';
import { projectApi } from '../../api/projectApi';

interface UpdateProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSuccess: () => void;
}

export const UpdateProgressModal: React.FC<UpdateProgressModalProps> = ({
  isOpen,
  onClose,
  project,
  onSuccess,
}) => {
  const [progress, setProgress] = useState(project.progressPercentage);
  const [status, setStatus] = useState(project.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await projectApi.updateProgress(project.id, progress, status);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Telemetry Update: Project Progress"
      subtitle={`Record ground-level physical progress verification for ${project.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-semibold text-slate-700">Physical Progress Percentage</label>
            <span className="font-black text-[#1A73E8] text-sm">{progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value, 10))}
            className="w-full accent-[#1A73E8] cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Operational Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-xs transition-colors"
          >
            <option value="IN_PROGRESS">IN_PROGRESS (Active execution)</option>
            <option value="COMPLETED">COMPLETED (100% Commissioned)</option>
            <option value="DELAYED">DELAYED (Execution stalled)</option>
            <option value="NOT_STARTED">NOT_STARTED (Preliminary)</option>
          </select>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-slate-600 leading-relaxed">
          Updating physical progress will trigger an automatic recalculation of the
          <strong className="text-slate-800"> ProjectSetu Risk Intelligence Engine</strong> and update Schedule Performance Index (SPI).
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white font-bold shadow-xs disabled:opacity-50 transition-colors"
          >
            {loading ? 'Submitting...' : 'Log Progress Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
