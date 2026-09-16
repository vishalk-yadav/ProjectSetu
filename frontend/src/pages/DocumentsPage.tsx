import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Trash2, UploadCloud, Search, AlertCircle, Plus } from 'lucide-react';
import { documentApi } from '../api/documentApi';
import { DocumentItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate, getDocumentUrl } from '../utils/formatters';
import { UploadDocumentModal } from '../components/documents/UploadDocumentModal';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const docs = await documentApi.listDocuments();
      setDocuments(docs || []);
    } catch (e) {
      console.error('Failed to load documents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete official document "${name}" from repository?`)) return;
    try {
      await documentApi.deleteDocument(id);
      await loadDocs();
    } catch (e) {
      console.error('Failed to delete document:', e);
    }
  };

  const filtered = documents.filter((d) => {
    const matchesCategory = categoryFilter ? d.category === categoryFilter : true;
    const matchesSearch = search
      ? d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.project?.name && d.project.name.toLowerCase().includes(search.toLowerCase())) ||
        (d.uploadedBy?.name && d.uploadedBy.name.toLowerCase().includes(search.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner message="Accessing secure document repository..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F223D] dark:text-white font-heading tracking-tight">
            Centralized Document Repository
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official project DPRs, sanction memos, quality inspection certifications & financial audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Upload Document Primary Action */}
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by memo title, project name, or officer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500 shadow-2xs"
          >
            <option value="">All Categories ({documents.length})</option>
            <option value="Project Proposal">Project Proposal</option>
            <option value="Progress Report">Progress Report</option>
            <option value="Financial Report">Financial Report</option>
            <option value="Approval Document">Approval Document</option>
            <option value="Inspection Report">Inspection Report</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#0F223D] dark:text-white mb-1">
                No official documents found
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                {categoryFilter || search
                  ? 'No documents match your current filter criteria. Try adjusting your search query or category.'
                  : 'Start building the centralized repository by uploading your first project DPR, memo, or audit record.'}
              </p>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Document</span>
              </button>
            </div>
          ) : (
            filtered.map((doc) => (
              <div
                key={doc.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1A73E8] dark:text-blue-400 border border-blue-100 dark:border-blue-900/60 shrink-0 mt-0.5 sm:mt-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#0F223D] dark:text-white truncate">
                      {doc.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Project:{' '}
                      <span
                        onClick={() => navigate(`/projects/${doc.projectId}`)}
                        className="text-[#1A73E8] dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                      >
                        {doc.project?.name || doc.projectId}
                      </span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                        {doc.category}
                      </span>
                      <span>
                        Uploaded: <strong className="text-slate-700 dark:text-slate-300 font-medium">{formatDate(doc.uploadedAt)}</strong>
                      </span>
                      {doc.uploadedBy && (
                        <span>
                          Officer: <strong className="text-slate-700 dark:text-slate-300 font-medium">{doc.uploadedBy.name}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <a
                    href={getDocumentUrl(doc.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-200 hover:text-[#1A73E8] dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-700 text-xs font-bold transition-colors"
                  >
                    <span>Download</span>
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={loadDocs}
      />
    </div>
  );
};

