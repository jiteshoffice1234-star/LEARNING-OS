import { useRef, useState, useEffect, useCallback } from 'react';
import {
  FileText, Image, Search, Upload, Trash2, ExternalLink,
  CheckCircle2, AlertCircle, Github, RefreshCw, Loader2, File,
} from 'lucide-react';
import {
  listGitHubFiles, uploadGitHubFile, deleteGitHubFile,
  getGitHubConfig, type GitHubFile, type FileCategory,
  formatFileSize,
} from '../lib/githubFiles';
import FileViewer from '../components/FileViewer';

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.md,.html';

const CATEGORIES: Array<'All' | FileCategory> = ['All', 'pdf', 'image', 'document', 'other'];
const CATEGORY_LABEL: Record<'All' | FileCategory, string> = {
  All: 'All',
  pdf: 'PDF',
  image: 'Images',
  document: 'Docs',
  other: 'Other',
};

function categoryStyle(type: FileCategory): string {
  if (type === 'pdf') return 'bg-primary/15 text-primary';
  if (type === 'image') return 'bg-success/15 text-success';
  if (type === 'document') return 'bg-accent/15 text-accent';
  return 'bg-muted/15 text-muted';
}

function CategoryIcon({ type, className }: { type: FileCategory; className?: string }) {
  if (type === 'image') return <Image className={className} />;
  if (type === 'pdf' || type === 'document') return <FileText className={className} />;
  return <File className={className} />;
}

export default function Vault() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | FileCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [viewer, setViewer] = useState<GitHubFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = getGitHubConfig();
  const repoUrl = `https://github.com/${config.owner}/${config.repo}/tree/${config.branch}/${config.folder}`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listGitHubFiles();
      setFiles(list);
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : 'Failed to load files from GitHub.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const picked = Array.from(fileList);
    setUploading(true);
    setNotice(null);

    const errors: string[] = [];
    let uploaded = 0;

    for (let i = 0; i < picked.length; i += 1) {
      setUploadProgress(`Uploading ${i + 1}/${picked.length}…`);
      const result = await uploadGitHubFile(picked[i]);
      if (result.ok) uploaded += 1;
      else errors.push(`${picked[i].name}: ${result.error}`);
    }

    setUploadProgress('');
    setUploading(false);

    if (uploaded > 0) await load();

    if (errors.length) {
      setNotice({ kind: 'error', text: errors[0] });
    } else if (uploaded > 0) {
      setNotice({
        kind: 'ok',
        text: `Uploaded ${uploaded} file${uploaded === 1 ? '' : 's'} to GitHub.`,
      });
    }
  };

  const handleDelete = async (file: GitHubFile): Promise<boolean> => {
    const confirmed = window.confirm(`Delete "${file.name}" from GitHub?\n\nThis removes it from the repository and cannot be undone.`);
    if (!confirmed) return false;

    const result = await deleteGitHubFile(file.path);
    if (result.ok) {
      setFiles((prev) => prev.filter((f) => f.path !== file.path));
      setNotice({ kind: 'ok', text: `Deleted "${file.name}" from GitHub.` });
      return true;
    }
    setNotice({ kind: 'error', text: result.error });
    return false;
  };

  const pdfCount = files.filter((f) => f.type === 'pdf').length;
  const imageCount = files.filter((f) => f.type === 'image').length;
  const docCount = files.filter((f) => f.type === 'document').length;
  const otherCount = files.filter((f) => f.type === 'other').length;

  const visibleFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesCategory = selectedCategory === 'All' || f.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-text">Achievement Vault</h1>
          <p className="text-xs text-muted truncate">
            {loading ? 'Loading…' : `${files.length} file${files.length === 1 ? '' : 's'}`} · {config.owner}/{config.repo}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={load}
            disabled={loading || uploading}
            aria-label="Refresh file list"
            className="p-2 rounded-lg bg-elevated text-muted hover:text-text transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{uploading ? uploadProgress || 'Uploading…' : 'Upload'}</span>
          </button>
        </div>
      </div>

      {/* Connection card */}
      <div className="glass-card rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-success/10 text-success border border-success/20">
          <Github className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-medium">Connected to GitHub</span>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex items-center gap-1 text-[10px] text-muted hover:text-text"
          >
            Open folder <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-[10px] text-muted mt-1.5 px-1">
          PDFs, images, and documents are stored in <span className="text-text">/{config.folder}</span> on branch{' '}
          <span className="text-text">{config.branch}</span>. Click any file to open it here.
        </p>
      </div>

      {notice && (
        <div
          className={`flex items-start gap-2 mb-3 px-3 py-2 rounded-lg text-xs border ${
            notice.kind === 'ok'
              ? 'bg-success/10 text-success border-success/20'
              : 'bg-danger/10 text-danger border-danger/20'
          }`}
        >
          {notice.kind === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <span className="break-words">{notice.text}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: 'Files', value: files.length, color: 'text-text' },
          { label: 'PDFs', value: pdfCount, color: 'text-primary' },
          { label: 'Images', value: imageCount, color: 'text-success' },
          { label: 'Docs', value: docCount + otherCount, color: 'text-accent' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-lg px-2 py-2 text-center">
            <p className={`text-sm font-semibold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search and filters */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 bg-elevated/50 rounded-lg px-2.5 py-2 border border-border/50">
          <Search className="w-3.5 h-3.5 text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search files…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-text placeholder:text-muted outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text'
              }`}
            >
              {CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* File list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          <p className="text-xs">Loading your vault from GitHub…</p>
        </div>
      ) : visibleFiles.length > 0 ? (
        <div className="space-y-1.5">
          {visibleFiles.map((f) => (
            <div
              key={`${f.path}-${f.sha}`}
              role="button"
              tabIndex={0}
              onClick={() => setViewer(f)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setViewer(f);
              }}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-elevated/30 hover:bg-elevated/60 transition-colors cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryStyle(f.type)}`}>
                <CategoryIcon type={f.type} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text truncate">{f.name}</p>
                <p className="text-[10px] text-muted">
                  {formatFileSize(f.size)} · {f.type === 'pdf' ? 'PDF' : f.type === 'image' ? 'Image' : f.type === 'document' ? 'Document' : 'File'}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewer(f);
                }}
                aria-label={`Open ${f.name}`}
                className="p-2 rounded text-muted hover:text-primary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(f);
                }}
                aria-label={`Delete ${f.name}`}
                className="p-2 rounded text-muted hover:text-danger transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-elevated/30 flex items-center justify-center mb-4">
            <Github className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-sm font-medium text-text">Your vault is empty</h3>
          <p className="text-xs text-muted mt-1 mb-4">Upload a PDF, image, or document to store it in your GitHub repo.</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            Upload your first file
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-muted">No files match this filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {viewer && (
        <FileViewer
          file={viewer}
          onClose={() => setViewer(null)}
          onDelete={async () => {
            const deleted = await handleDelete(viewer);
            if (deleted) setViewer(null);
          }}
        />
      )}
    </div>
  );
}
