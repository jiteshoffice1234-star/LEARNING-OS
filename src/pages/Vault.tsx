import { useRef, useState } from 'react';
import {
  Award, FileText, Image, Search, Upload, Shield, Trash2, ExternalLink,
  CheckCircle2, AlertCircle, Cloud, CloudOff,
} from 'lucide-react';
import { achievements } from '../data/mockData';
import {
  listFiles, uploadFile, removeFile, isSupabaseConfigured,
  type StoredFile,
} from '../lib/files';
import { formatBytes } from '../lib/storage';

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx';

export default function Vault() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<StoredFile[]>(() => listFiles());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', 'Certification', 'Achievement', 'Education', 'Project'];

  const filteredAchievements = achievements.filter((a) => {
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.issuer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setBusy(true);
    setNotice(null);

    const uploaded: StoredFile[] = [];
    const errors: string[] = [];

    for (const file of Array.from(fileList)) {
      const result = await uploadFile(file);
      if (result.ok) uploaded.push(result.file);
      else errors.push(result.error);
    }

    if (uploaded.length) setFiles((prev) => [...uploaded, ...prev]);

    if (errors.length) {
      setNotice({ kind: 'error', text: errors[0] });
    } else if (uploaded.length) {
      setNotice({
        kind: 'ok',
        text: `Uploaded ${uploaded.length} file${uploaded.length === 1 ? '' : 's'}${
          isSupabaseConfigured() ? ' to Supabase Storage' : ' (saved locally — connect Supabase for cloud storage)'
        }.`,
      });
    }
    setBusy(false);
  };

  const handleDelete = async (id: string) => {
    await removeFile(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const openPicker = () => inputRef.current?.click();

  // Live counts derived from real uploads + demo achievements.
  const counts = {
    pdf: files.filter((f) => f.type === 'application/pdf').length,
    images: files.filter((f) => f.type.startsWith('image/')).length,
    docs: files.filter((f) => /word|text|sheet|excel|presentation/.test(f.type)).length,
    certs: achievements.filter((a) => a.verified).length + files.filter((f) => /certificate/i.test(f.name)).length,
  };

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      {/* Hidden picker */}
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
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-text">Achievement Vault</h1>
          <p className="text-xs text-muted">
            {achievements.length + files.length} items · {formatBytes(totalBytes)} uploaded
          </p>
        </div>
        <button
          onClick={openPicker}
          disabled={busy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{busy ? 'Uploading…' : 'Upload'}</span>
        </button>
      </div>

      {/* Storage backend banner */}
      <div
        className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs ${
          isSupabaseConfigured()
            ? 'bg-success/10 text-success border border-success/20'
            : 'bg-warning/10 text-warning border border-warning/20'
        }`}
      >
        {isSupabaseConfigured() ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
        {isSupabaseConfigured()
          ? 'Connected to Supabase — uploads are stored in the cloud and sync across devices.'
          : 'Not connected to Supabase yet — uploads save to this browser only (max 1.5 MB each). Add your Project URL and anon key in Settings → Supabase to enable cloud storage.'}
      </div>

      {/* Notice */}
      {notice && (
        <div
          className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs border ${
            notice.kind === 'ok'
              ? 'bg-success/10 text-success border-success/20'
              : 'bg-danger/10 text-danger border-danger/20'
          }`}
        >
          {notice.kind === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-text font-medium">{achievements.length + files.length}</span>
          <span className="text-[10px] text-muted">Total</span>
        </div>
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-success font-medium">{achievements.filter((a) => a.verified).length}</span>
          <span className="text-[10px] text-muted">Verified</span>
        </div>
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-primary font-medium">{files.length}</span>
          <span className="text-[10px] text-muted">Uploads</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-elevated/50 rounded-lg px-2.5 py-1.5 border border-border/50">
          <Search className="w-3.5 h-3.5 text-muted" />
          <input
            type="text"
            placeholder="Search..."
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

      {/* Your Uploads */}
      {files.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-text mb-2">Your Uploads ({files.length})</h3>
          <div className="space-y-1.5">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-elevated/30 hover:bg-elevated/50 transition-colors group"
              >
                {f.type.startsWith('image/') ? (
                  <img src={f.url} alt={f.name} className="w-9 h-9 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded bg-elevated flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text truncate">{f.name}</p>
                  <p className="text-[10px] text-muted">
                    {formatBytes(f.size)} · {f.origin === 'supabase' ? 'Cloud' : 'This device'}
                  </p>
                </div>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${f.name}`}
                  className="p-1.5 rounded text-muted hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(f.id)}
                  aria-label={`Delete ${f.name}`}
                  className="p-1.5 rounded text-muted hover:text-danger transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filteredAchievements.map((achievement) => (
          <div key={achievement.id} className="glass-card rounded-lg p-3 hover:border-primary/30 transition-all group">
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-primary" />
              </div>
              {achievement.verified && (
                <span className="flex items-center gap-0.5 text-[9px] text-success bg-success/10 px-1 py-0.5 rounded">
                  <Shield className="w-2.5 h-2.5" /> ✓
                </span>
              )}
            </div>
            <h3 className="text-xs font-semibold text-text mb-0.5 line-clamp-2">{achievement.title}</h3>
            <p className="text-[10px] text-muted mb-2 line-clamp-1">{achievement.issuer}</p>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted">{achievement.date}</span>
              <span className="text-[9px] px-1 py-0.5 rounded bg-elevated text-muted">{achievement.category}</span>
            </div>
          </div>
        ))}

        {/* Upload drop-zone */}
        <button
          type="button"
          onClick={openPicker}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`rounded-lg border border-dashed p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[120px] ${
            dragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
          }`}
        >
          <div className="w-8 h-8 rounded bg-elevated/50 flex items-center justify-center">
            <Upload className="w-4 h-4 text-muted" />
          </div>
          <div className="text-center">
            <p className="text-xs text-text font-medium">{busy ? 'Uploading…' : 'Upload'}</p>
            <p className="text-[10px] text-muted">PDF, JPG, PNG · drop or click</p>
          </div>
        </button>
      </div>

      {/* File Types */}
      <div className="mt-6 glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text mb-4">File Types</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: FileText, label: 'PDFs', count: counts.pdf, color: 'text-danger' },
            { icon: Image, label: 'Images', count: counts.images, color: 'text-success' },
            { icon: FileText, label: 'Documents', count: counts.docs, color: 'text-primary' },
            { icon: Award, label: 'Certificates', count: counts.certs, color: 'text-warning' },
          ].map((type) => (
            <div key={type.label} className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30">
              <type.icon className={`w-5 h-5 ${type.color}`} />
              <div>
                <p className="text-sm font-medium text-text">{type.count}</p>
                <p className="text-xs text-muted">{type.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
