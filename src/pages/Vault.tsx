import { useRef, useState, useEffect } from 'react';
import {
  FileText, Image, Search, Upload, Shield, Trash2, ExternalLink,
  CheckCircle2, AlertCircle, Cloud, CloudOff, Github, Folder, File,
} from 'lucide-react';
import { formatBytes } from '../lib/storage';
import {
  listGitHubFiles, uploadGitHubFile, deleteGitHubFile,
  getGitHubConfig, saveGitHubConfig, clearGitHubConfig,
  isGitHubConfigured, type GitHubFile,
  getFileIcon, formatFileSize, canPreview,
} from '../lib/githubFiles';
import FileViewer from '../components/FileViewer';

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.md,.html';

export default function Vault() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [ghFiles, setGhFiles] = useState<GitHubFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [showViewer, setShowViewer] = useState<GitHubFile | null>(null);
  const [ghConfigured, setGhConfigured] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ghInputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', 'PDF', 'Image', 'Document', 'Other'];

  // Load GitHub files on mount
  const ghConfiguredValue = isGitHubConfigured();

  useEffect(() => {
    setGhConfigured(ghConfiguredValue);
    if (ghConfiguredValue) {
      loadGitHubFiles();
    }
  }, [ghConfiguredValue]);

  async function loadGitHubFiles() {
    try {
      const files = await listGitHubFiles();
      setGhFiles(files);
    } catch (e) {
      console.error('Failed to load GitHub files', e);
      setNotice({ kind: 'error', text: 'Failed to load files from GitHub.' });
    }
  }

  const handleGitHubFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setNotice(null);

    const config = getGitHubConfig();
    if (!config) {
      setNotice({ kind: 'error', text: 'GitHub not configured. Please add your GitHub token in Settings.' });
      setUploading(false);
      return;
    }

    const uploaded: GitHubFile[] = [];
    const errors: string[] = [];

    for (const file of Array.from(fileList)) {
      const result = await uploadGitHubFile(file);
      if (result.ok) uploaded.push(result.file);
      else errors.push(result.error);
    }

    if (uploaded.length) {
      setGhFiles((prev) => [...uploaded, ...prev]);
    }

    if (errors.length) {
      setNotice({ kind: 'error', text: errors[0] ?? 'Upload failed.' });
    } else if (uploaded.length) {
      setNotice({
        kind: 'ok',
        text: `Uploaded ${uploaded.length} file${uploaded.length === 1 ? '' : 's'} to GitHub.`,
      });
    }
    setUploading(false);
  };

  const handleDeleteGH = async (file: GitHubFile) => {
    const result = await deleteGitHubFile(file.path);
    if (result.ok) {
      setGhFiles((prev) => prev.filter((f) => f.id !== file.id));
      setNotice({ kind: 'ok', text: 'Deleted from GitHub.' });
    } else {
      setNotice({ kind: 'error', text: result.error });
    }
  };

  const openGhPicker = () => ghInputRef.current?.click();

  const filterByCategory = (files: GitHubFile[], category: string) => {
    if (category === 'All') return files;
    return files.filter((f) => {
      const ext = f.name.toLowerCase().split('.').pop() || '';
      if (category === 'PDF') return ext === 'pdf';
      if (category === 'Image') return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
      if (category === 'Document') return ['doc', 'docx', 'txt', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'md', 'html'].includes(ext);
      return true;
    });
  };

  const filteredGhFiles = ghFiles.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const ghPdfCount = ghFiles.filter((f) => f.name.toLowerCase().endsWith('.pdf')).length;
  const ghImgCount = ghFiles.filter((f) => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes((f.name.toLowerCase().split('.').pop() || '') as string)).length;

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      {/* Hidden file picker */}
      <input
        ref={ghInputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          handleGitHubFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-text">Achievement Vault</h1>
          <p className="text-xs text-muted">
            {ghFiles.length} files · GitHub Storage
          </p>
        </div>
        <button
          onClick={openGhPicker}
          disabled={uploading || !ghConfigured}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            ghConfigured ? 'bg-primary text-white hover:bg-primary/90' : 'bg-elevated text-muted hover:bg-elevated/80'
          } ${!ghConfigured ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{uploading ? 'Uploading…' : 'Upload to GitHub'}</span>
        </button>
      </div>

      {/* GitHub Connection Status */}
      <div className="glass-card rounded-xl p-4 mb-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
          ghConfigured ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'
        }`}>
          {ghConfigured ? <Github className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
          <span className="text-xs font-medium">{ghConfigured ? 'GitHub Connected' : 'Not Connected to GitHub'}</span>
          {ghConfigured && (
            <span className="ml-2 text-[10px] text-muted">Files sync to your GitHub repo</span>
          )}
        </div>
        <p className="text-[10px] text-muted mt-1">
          {ghConfigured
            ? 'Upload PDFs, images, and documents to your GitHub repo. Files are stored publicly in your repository.'
            : 'Connect your GitHub account in Settings to store files in the cloud. Files persist across devices and are accessible from anywhere.'}
        </p>
      </div>

      {/* Notice */}
      {notice && (
        <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs border ${
          notice.kind === 'ok'
            ? 'bg-success/10 text-success border-success/20'
            : 'bg-danger/10 text-danger border-danger/20'
        }`}>
          {notice.kind === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-text font-medium">{ghFiles.length}</span>
          <span className="text-[10px] text-muted">Files</span>
        </div>
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-success font-medium">{ghPdfCount}</span>
          <span className="text-[10px] text-muted">PDFs</span>
        </div>
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-primary font-medium">{ghImgCount}</span>
          <span className="text-[10px] text-muted">Images</span>
        </div>
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-accent font-medium">{ghFiles.length - ghPdfCount - ghImgCount}</span>
          <span className="text-[10px] text-muted">Docs</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-elevated/50 rounded-lg px-2.5 py-1.5 border border-border/50">
          <Search className="w-3.5 h-3.5 text-muted" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-text placeholder:text-muted outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                selectedCategory === cat ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Your Files */}
      {ghFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-text mb-2">Your Files ({ghFiles.length})</h3>
          <div className="space-y-1.5">
            {filterByCategory(filteredGhFiles, selectedCategory).map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-elevated/30 hover:bg-elevated/50 transition-colors group"
              >
                <div className={`w-9 h-9 rounded flex items-center justify-center flex-shrink-0 ${
                  f.type === 'pdf' ? 'bg-primary/15' :
                  f.type === 'image' ? 'bg-success/15' :
                  f.type === 'document' ? 'bg-accent/15' :
                  'bg-muted/15'
                }`}>
                  <File className="w-4 h-4 text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text truncate">{f.name}</p>
                  <p className="text-[10px] text-muted">
                    {formatFileSize(f.size)} · GitHub
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowViewer(f)}
                  className="p-1.5 rounded text-muted hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteGH(f)}
                  aria-label={`Delete ${f.name}`}
                  className="p-1.5 rounded text-muted hover:text-danger transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {filteredGhFiles.length === 0 && (
              <div className="text-center py-8 text-center">
                <p className="text-sm text-muted">No files in this category.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {ghFiles.length === 0 && (
        <div className="text-center py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-elevated/30 flex items-center justify-center mx-auto mb-4">
              <Github className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-sm font-medium text-text">No files yet</h3>
            <p className="text-xs text-muted">Upload your first file to GitHub.</p>
            <button
              type="button"
              onClick={openGhPicker}
              disabled={!ghConfigured}
              className={`mt-4 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                ghConfigured ? 'bg-primary text-white hover:bg-primary/90' : 'bg-elevated text-muted hover:bg-elevated/80 opacity-50 cursor-not-allowed'
              }`}
            >
              {ghConfigured ? 'Upload File' : 'Connect GitHub First'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
