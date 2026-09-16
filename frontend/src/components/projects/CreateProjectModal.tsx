import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Department } from '../../types';
import { departmentApi } from '../../api/departmentApi';
import { projectApi } from '../../api/projectApi';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
    location: '',
    latitude: '28.6139',
    longitude: '77.2090',
    startDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    allocatedBudget: '250000000', // 25 Cr
    priority: 'HIGH',
  });

  useEffect(() => {
    if (isOpen) {
      departmentApi.listDepartments().then((data) => {
        setDepartments(data);
        if (data.length > 0 && !formData.departmentId) {
          setFormData((prev) => ({ ...prev, departmentId: data[0].id }));
        }
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.departmentId || !formData.allocatedBudget) {
      setError('Project Name, Department, and Allocated Budget are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await projectApi.createProject({
        name: formData.name,
        description: formData.description,
        departmentId: formData.departmentId,
        location: formData.location || 'New Delhi, India',
        latitude: parseFloat(formData.latitude) || 28.6139,
        longitude: parseFloat(formData.longitude) || 77.2090,
        startDate: formData.startDate,
        expectedCompletionDate: formData.expectedCompletionDate,
        allocatedBudget: parseFloat(formData.allocatedBudget),
        priority: formData.priority,
        status: 'IN_PROGRESS',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sanction & Register New Project"
      subtitle="Commission an integrated government initiative across line ministries"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Project Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. National Smart Grid Feeder Network Phase 2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nodal Ministry / Department *</label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-xs transition-colors"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Priority Classification</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-xs transition-colors"
            >
              <option value="CRITICAL">CRITICAL (Mission-Mode)</option>
              <option value="HIGH">HIGH Priority</option>
              <option value="MEDIUM">MEDIUM Priority</option>
              <option value="LOW">LOW Priority</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Project Scope & Description</label>
          <textarea
            rows={3}
            placeholder="Outline objectives, civil deliverables, target beneficiaries..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Location / Site</label>
            <input
              type="text"
              placeholder="e.g. Pune, Maharashtra"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs transition-colors"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-xs transition-colors"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-xs transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sanctioned Budget (INR) *</label>
            <input
              type="number"
              required
              value={formData.allocatedBudget}
              onChange={(e) => setFormData({ ...formData, allocatedBudget: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-xs transition-colors"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              ₹{(parseFloat(formData.allocatedBudget || '0') / 10000000).toFixed(2)} Crore
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Commencement Date *</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Completion Date *</label>
            <input
              type="date"
              required
              value={formData.expectedCompletionDate}
              onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-xs transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
            {loading ? 'Creating Project...' : 'Sanction Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
