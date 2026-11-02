import { useEffect, useState } from 'react';
import {
  FileText, Image as ImageIcon, File, X, Download, ExternalLink, Trash2, Loader2,
} from 'lucide-react';
import type { GitHubFile } from '../lib/githubFiles';
import { formatFileSize } from '../lib/githubFiles';

interface FileViewerProps {
  file: GitHubFile;
  onClose: () => void;
  onDelete?: () => Promise<void> | void;
  isOwner?: boolean;
}

function CategoryIcon({ type, className }: { type: GitHubFile['type']; className?: string }) {
  if (type === 'image') return <ImageIcon className={className} />;
  if (type === 'pdf' || type === 'document') return <FileText className={className} />;
  return <File className={className} />;
}

const TEXT_EXTS = ['txt', 'md', 'html', 'json', 'csv', 'rtf', 'log', 'xml', 'yaml', 'yml'];

function extensionOf(name: string): string {
  return (name.toLowerCase().split('.').pop() || '') as string;
}

export default function FileViewer({ file, onClose, onDelete, isOwner = true }: FileViewerProps) {
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [onClose, pdfBlobUrl]);

  // Load plain-text documents inline so they're readable without leaving the app.
  const loadText = async () => {
    const ext = extensionOf(file.name);
    if (!TEXT_EXTS.includes(ext)) return;
    if (!file.download_url) return;
    setTextLoading(true);
    try {
      const res = await fetch(file.download_url);
      if (res.ok) {
        setText(await res.text());
      } else {
        setText(null);
      }
    } catch {
      setText(null);
    } finally {
      setTextLoading(false);
    }
  };

  useEffect(() => {
    if (file.type === 'document' && TEXT_EXTS.includes(extensionOf(file.name))) {
      loadText();
    }
  }, [file]);

  const isPdf = file.type === 'pdf';
  const isImage = file.type === 'image';
  const canOpen = Boolean(file.download_url);

  // Fetch PDF as a blob and create a local object URL. Serving it from the
  // browser itself bypasses GitHub's Content-Disposition: attachment header,
  // so the PDF renders inline instead of triggering a download.
  const loadPdfBlob = async () => {
    if (!file.download_url) return;
    setPdfLoading(true);
    try {
      const res = await fetch(file.download_url);
      if (!res.ok) throw new Error('Failed to fetch PDF');
      const blob = await res.blob();
      setPdfBlobUrl(URL.createObjectURL(blob));
    } catch {
      setPdfBlobUrl(null);
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    if (isPdf && canOpen && file.download_url && !pdfBlobUrl && !pdfLoading) {
      loadPdfBlob();
    }
  }, [file, isPdf, canOpen, pdfBlobUrl, pdfLoading]);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-3xl max-h-[92vh] bg-surface rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-border">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              file.type === 'pdf'
                ? 'bg-primary/15 text-primary'
                : file.type === 'image'
                ? 'bg-success/15 text-success'
                : file.type === 'document'
                ? 'bg-accent/15 text-accent'
                : 'bg-muted/15 text-muted'
            }`}
          >
            <CategoryIcon type={file.type} className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-text truncate">{file.name}</h2>
            <p className="text-[10px] text-muted">
              {file.type === 'pdf' ? 'PDF' : file.type === 'image' ? 'Image' : file.type === 'document' ? 'Document' : 'File'} ·{' '}
              {formatFileSize(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg hover:bg-elevated text-muted flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 bg-bg min-h-[240px]">
          {/* PDF — inline render via blob URL (no external viewer, no download prompt) */}
          {isPdf && canOpen ? (
            <div className="flex flex-col items-center justify-center gap-2">
              {pdfLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-xs text-muted">Loading PDF…</p>
                </div>
              ) : pdfBlobUrl ? (
                <>
                  <embed
                    type="application/pdf"
                    src={pdfBlobUrl}
                    className="w-full h-[62vh] rounded-lg border border-border bg-white"
                    title={file.name}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-xs text-muted">Could not load PDF preview.</p>
                </div>
              )}
              <p className="text-[10px] text-muted text-center">
                Preview not loading? Use “Download” or “Open in new tab” below.
              </p>
            </div>
          ) : isImage && canOpen ? (
            <div className="flex items-center justify-center">
              <img
                src={file.download_url}
                alt={file.name}
                className="max-w-full max-h-[65vh] rounded-lg border border-border object-contain"
              />
            </div>
          ) : text !== null ? (
            <div className="text-sm text-text leading-relaxed break-words whitespace-pre-wrap font-mono text-[12px]">
              {text}
            </div>
          ) : textLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-xs text-muted">Reading file…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CategoryIcon type={file.type} className="w-12 h-12 text-muted/30 mb-3" />
              <p className="text-sm text-text">Preview not available for this file type</p>
              <p className="text-xs text-muted mt-1">Open or download it to view the contents.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4 border-t border-border bg-surface/50">
          {canOpen && (
            <a
              href={file.download_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-elevated text-text text-xs font-medium hover:bg-elevated/80 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          )}
          {canOpen && (
            <a
              href={file.download_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-elevated text-text text-xs font-medium hover:bg-elevated/80 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in new tab
            </a>
          )}
          <a
            href={file.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-elevated text-text text-xs font-medium hover:bg-elevated/80 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            GitHub
          </a>
          {isOwner && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-danger/15 text-danger text-xs font-medium hover:bg-danger/25 transition-colors disabled:opacity-60"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
