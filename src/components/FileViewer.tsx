import { FileText, Image, File, X, Download, ExternalLink, Trash2, CheckCircle2 } from 'lucide-react';
import { getFileIcon, formatFileSize, canPreview } from '../lib/githubFiles';

interface FileViewerProps {
  file: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    download_url: string;
    html_url: string;
    created_at: string;
    path: string;
    sha: string;
  };
  onClose: () => void;
  onDelete?: (id: string, path: string) => Promise<void>;
  isOwner?: boolean;
}

export default function FileViewer({
  file,
  onClose,
  onDelete,
  isOwner = false,
}: FileViewerProps) {
  const fileType = getFileIcon(file.name);
  const fileIcon = getFileIcon(file.name);
  const fileSize = formatFileSize(file.size);
  const canPreviewFile = canPreview(file.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-surface rounded-2xl shadow-2xl border border-border flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              fileType === 'pdf' ? 'bg-primary/15' :
              fileType === 'image' ? 'bg-success/15' :
              fileType === 'document' ? 'bg-accent/15' :
              'bg-muted/15'
            }`}>
              {fileIcon === 'FileText' ? <FileText className="w-5 h-5 text-primary" /> : null}
              {fileIcon === 'Image' ? <Image className="w-5 h-5 text-success" /> : null}
              <File className="w-5 h-5 text-muted" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text truncate">{file.name}</h2>
              <p className="text-[10px] text-muted">{fileType} • {fileSize}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg hover:bg-elevated text-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-bg">
          {canPreviewFile && fileType === 'pdf' ? (
            <div className="flex flex-col items-center justify-center py-8">
              <iframe
                src={file.download_url}
                className="w-full h-[500px] rounded-lg border border-border"
                title={file.name}
              />
            </div>
          ) : canPreviewFile && fileType === 'image' ? (
            <img
              src={file.download_url}
              alt={file.name}
              className="max-w-full max-h-[60vh] rounded-lg border border-border object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <File className="w-12 h-12 text-muted/30 mb-3" />
              <p className="text-sm text-muted">Cannot preview this file type</p>
              <p className="text-[10px] text-muted/50">{file.name}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-surface/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(file.download_url, '_blank')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors"
            >
              <Download className="w-3 h-3 mr-1.5" />
              Download
            </button>
            <button
              onClick={() => window.open(file.html_url, '_blank')}
              className="px-3 py-2 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View on GitHub
            </button>
          </div>
          {isOwner && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(file.id, file.path)}
              className="px-3 py-2 rounded-lg bg-danger/15 text-danger hover:bg-danger/25 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
