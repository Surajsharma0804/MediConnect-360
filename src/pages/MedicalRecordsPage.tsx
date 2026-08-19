import React, { useState, useCallback, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  File,
  Image,
  FileSpreadsheet,
  FilePlus,
  X,
  Calendar,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle2,
  Brain,
} from 'lucide-react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery';
import { documentsAPI, type MedicalDocument, type DocumentType } from '../services/documents.api';

// ─── File Icon Helper ─────────────────────────────────────────────────────────

const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return <File className="h-5 w-5" />;
  if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-purple-500" />;
  if (mimeType === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
  return <File className="h-5 w-5 text-blue-500" />;
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const documentTypeColors: Record<string, string> = {
  prescription: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  lab_report: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  imaging: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  discharge_summary: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  insurance: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  vaccination: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  other: 'bg-slate-50 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300',
};

// ─── Upload Modal ─────────────────────────────────────────────────────────────

const UploadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, type: DocumentType, tags: string[]) => void;
  isUploading: boolean;
}> = ({ isOpen, onClose, onUpload, isUploading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>('other');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Upload Medical Document</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.csv"
              onChange={e => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                {getFileIcon(selectedFile.type)}
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="p-1 text-red-500 hover:bg-red-50 rounded">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600 dark:text-slate-400">Drop a file here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">PDF, Images, Documents up to 10MB</p>
              </>
            )}
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Document Type</label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
            >
              <option value="prescription">Prescription</option>
              <option value="lab_report">Lab Report</option>
              <option value="imaging">Imaging (X-Ray, MRI, CT)</option>
              <option value="discharge_summary">Discharge Summary</option>
              <option value="insurance">Insurance Document</option>
              <option value="vaccination">Vaccination Record</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="e.g. cardiology, 2024"
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
              />
              <button onClick={addTag} className="px-3 py-2 bg-slate-100 dark:bg-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-500">
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    {tag}
                    <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            Cancel
          </button>
          <button
            onClick={() => selectedFile && onUpload(selectedFile, docType, tags)}
            disabled={!selectedFile || isUploading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Document Row ─────────────────────────────────────────────────────────────

const DocumentRow: React.FC<{
  doc: MedicalDocument;
  onDelete: (id: string) => void;
  onAnalyze: (id: string) => void;
}> = ({ doc, onDelete, onAnalyze }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-4 hover:shadow-sm transition-shadow">
    {/* Icon */}
    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
      {getFileIcon(doc.mimeType)}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">{doc.originalName || doc.fileName}</h3>
      <div className="flex items-center gap-3 mt-0.5">
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${documentTypeColors[doc.documentType] || documentTypeColors.other}`}>
          {doc.documentType?.replace('_', ' ') || 'Other'}
        </span>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <span className="text-xs text-slate-400">{formatFileSize(doc.fileSize)}</span>
      </div>
      {doc.tags && doc.tags.length > 0 && (
        <div className="flex gap-1 mt-1.5">
          {doc.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>

    {/* Status */}
    <div className="flex-shrink-0">
      {doc.status === 'processing' && (
        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <Loader2 className="h-3 w-3 animate-spin" /> Processing
        </span>
      )}
      {doc.status === 'verified' && (
        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </span>
      )}
      {doc.aiAnalysis && (
        <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
          <Brain className="h-3 w-3" /> AI Analyzed
        </span>
      )}
    </div>

    {/* Actions */}
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        onClick={() => onAnalyze(doc.id)}
        title="AI Analyze"
        className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
      >
        <Brain className="h-4 w-4" />
      </button>
      <button
        onClick={() => window.open(doc.downloadUrl || `/api/documents/${doc.id}/download`, '_blank')}
        title="Download"
        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
      >
        <Download className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(doc.id)}
        title="Delete"
        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const MedicalRecordsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: documents, isLoading, error, refetch } = useApiQuery<MedicalDocument[]>(
    'medical-documents',
    () => documentsAPI.getAll()
  );

  const uploadMutation = useApiMutation(
    (params: { file: File; type: DocumentType; tags: string[] }) =>
      documentsAPI.upload(params.file, { documentType: params.type, tags: params.tags }),
    {
      onSuccess: () => {
        setShowUploadModal(false);
        refetch();
      },
      invalidateKeys: ['medical-documents'],
    }
  );

  const deleteMutation = useApiMutation(
    (id: string) => documentsAPI.delete(id),
    {
      onSuccess: () => refetch(),
      invalidateKeys: ['medical-documents'],
    }
  );

  const analyzeMutation = useApiMutation(
    (id: string) => documentsAPI.analyzeWithAI(id),
    {
      onSuccess: () => refetch(),
      invalidateKeys: ['medical-documents'],
    }
  );

  // Filter documents
  const filteredDocs = (documents || []).filter(doc => {
    if (filterType && doc.documentType !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        doc.originalName?.toLowerCase().includes(q) ||
        doc.fileName?.toLowerCase().includes(q) ||
        doc.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Stats
  const totalDocs = documents?.length || 0;
  const totalSize = documents?.reduce((sum, d) => sum + (d.fileSize || 0), 0) || 0;
  const verifiedCount = documents?.filter(d => d.status === 'verified').length || 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Medical Records</h1>
          <p className="text-blue-100 mt-1">Securely store, manage, and analyze your medical documents</p>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-white">
              <span className="text-2xl font-bold">{totalDocs}</span>
              <span className="text-blue-200 ml-1 text-sm">documents</span>
            </div>
            <div className="text-white">
              <span className="text-2xl font-bold">{formatFileSize(totalSize)}</span>
              <span className="text-blue-200 ml-1 text-sm">total</span>
            </div>
            <div className="text-white">
              <span className="text-2xl font-bold">{verifiedCount}</span>
              <span className="text-blue-200 ml-1 text-sm">verified</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="prescription">Prescriptions</option>
              <option value="lab_report">Lab Reports</option>
              <option value="imaging">Imaging</option>
              <option value="discharge_summary">Discharge Summaries</option>
              <option value="insurance">Insurance</option>
              <option value="vaccination">Vaccination</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
          >
            <FilePlus className="h-4 w-4" /> Upload
          </button>

          <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">
            {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Document List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-500 mb-4">Failed to load documents</p>
            <button onClick={() => refetch()} className="btn-primary text-sm">Retry</button>
          </div>
        ) : filteredDocs.length > 0 ? (
          <div className="space-y-3">
            {filteredDocs.map(doc => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                onDelete={(id) => {
                  if (confirm('Delete this document? This action cannot be undone.')) {
                    deleteMutation.mutate(id);
                  }
                }}
                onAnalyze={(id) => analyzeMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No Documents</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {searchQuery || filterType
                ? 'No documents match your search criteria.'
                : 'Upload your first medical document to get started.'}
            </p>
            <button onClick={() => setShowUploadModal(true)} className="btn-primary text-sm flex items-center gap-2 mx-auto">
              <FilePlus className="h-4 w-4" /> Upload Document
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={(file, type, tags) => uploadMutation.mutate({ file, type, tags })}
        isUploading={uploadMutation.isLoading}
      />
    </div>
  );
};

export default MedicalRecordsPage;
