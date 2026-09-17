import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Paperclip, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { documentApi } from '../../api/documentApi';
import { projectApi } from '../../api/projectApi';
import { Project } from '../../types';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultProjectId?: string;
}

const DOCUMENT_CATEGORIES = [
  'Project Proposal',
  'Progress Report',
  'Financial Report',
  'Approval Document',
  'Inspection Report',
  'Other',
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultProjectId,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Project Proposal');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFile(null);
      setName('');
      setCategory('Project Proposal');
      setProjectId(defaultProjectId || '');

      const fetchProjects = async () => {
        try {
          setLoadingProjects(true);
          const res = await projectApi.listProjects({ limit: 100 });
          const items = res.data || [];
          setProjects(items);
          if (!defaultProjectId && items.length > 0) {
            setProjectId(items[0].id);
          }
        } catch (e) {
          console.error('Failed to load projects for document upload', e);
        } finally {
          setLoadingProjects(false);
        }
      };
      fetchProjects();
    }
  }, [isOpen, defaultProjectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!name) {
        setName(selected.name.replace(/\.[^/.]+$/, ''));
      }
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      if (!name) {
        setName(selected.name.replace(/\.[^/.]+$/, ''));
      }
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError('Please select an associated project.');
      return;
    }
    if (!file) {
      setError('Please attach a document file to upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      formData.append('name', name.trim() || file.name);
      formData.append('category', category);

      await documentApi.uploadDocument(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Document upload error:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to upload document. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('documents.uploadModalTitle')}
      subtitle={t('documents.uploadModalSubtitle')}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Associated Project */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Associated Project <span className="text-rose-500">*</span>
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
            disabled={loadingProjects || !!defaultProjectId}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-60"
          >
            {loadingProjects ? (
              <option>Loading active projects...</option>
            ) : projects.length === 0 ? (
              <option value="">No projects available</option>
            ) : (
              projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.department?.code || 'Govt Project'})
                </option>
              ))
            )}
          </select>
        </div>

        {/* 2. Document Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Document Title / Memo Name <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Detailed Project Report (DPR) Phase II"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* 3. Document Category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Document Category <span className="text-rose-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          >
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 4. File Dropzone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Attach Official File <span className="text-rose-500">*</span>
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.zip"
          />

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/60'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[#0F223D]">
                Click to browse or drag & drop official document
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                PDF, DOCX, XLSX, CSV, JPG, PNG or ZIP (Up to 25 MB)
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0F223D] truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-[#1A73E8] hover:underline cursor-pointer"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={uploading || !file || !projectId}
            className="px-5 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('documents.uploadBtn')}...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>{t('documents.uploadBtn')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
