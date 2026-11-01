import { useRef, useState } from 'react';
import { 
  Database, Download, Upload, HardDrive, Shield, Clock, 
  CheckCircle2, AlertCircle, FileArchive, Trash2, RefreshCw, Lock
} from 'lucide-react';
import {
  usePersistentState,
  exportAll,
  importAll,
  usedBytes,
  formatBytes,
  type ImportResult,
} from '../lib/storage';

interface BackupRecord {
  id: string;
  date: string;
  time: string;
  size: string;
  type: 'auto' | 'manual';
  files: number;
  /** Full snapshot taken at backup time, so each row can be re-downloaded/restored. */
  payload: unknown;
}

export default function BackupCenter() {
  const [backups, setBackups] = usePersistentState<BackupRecord[]>('backups', []);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bytes = usedBytes();
  const storageTotal = 5 * 1024 * 1024; // ~5MB is a typical localStorage quota
  const storagePercent = Math.min((bytes / storageTotal) * 100, 100);

  const flash = (kind: 'ok' | 'error', text: string) => {
    setFeedback({ kind, text });
    window.setTimeout(() => setFeedback(null), 4000);
  };

  /** Download a JSON object as a file. */
  const downloadJSON = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const timestamp = () => {
    const now = new Date();
    return {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
    };
  };

  /** Take a snapshot, record it in history, and download the file. */
  const handleBackup = () => {
    setIsBackingUp(true);
    try {
      const payload = exportAll();
      const { date, time } = timestamp();
      const record: BackupRecord = {
        id: Date.now().toString(),
        date,
        time,
        size: formatBytes(usedBytes()),
        type: 'manual',
        files: Object.keys((payload as { data?: object }).data ?? {}).length,
        payload,
      };
      setBackups([record, ...backups]);
      downloadJSON(payload, `learning-os-backup-${date}.json`);
      flash('ok', 'Backup downloaded to your device.');
    } catch (e) {
      flash('error', 'Backup failed. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };

  /** Export the live snapshot immediately (no history record). */
  const handleExportJSON = () => {
    try {
      downloadJSON(exportAll(), `learning-os-export-${timestamp().date}.json`);
      flash('ok', 'Export ready.');
    } catch {
      flash('error', 'Export failed.');
    }
  };

  /** Restore from a chosen .json file. */
  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const result: ImportResult = importAll(parsed);
        if (result.ok) flash('ok', result.message);
        else flash('error', result.message);
      } catch {
        flash('error', 'That file is not valid JSON.');
      }
    };
    reader.onerror = () => flash('error', 'Could not read the file.');
    reader.readAsText(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImportFile(file);
    e.target.value = ''; // allow re-selecting the same file
  };

  const handleRestoreRecord = (record: BackupRecord) => {
    const result = importAll(record.payload);
    if (result.ok) flash('ok', `Restored backup from ${record.date}. ${result.message}`);
    else flash('error', result.message);
  };

  const handleDeleteRecord = (id: string) => {
    setBackups(backups.filter(b => b.id !== id));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Backup Center</h1>
          <p className="text-sm text-muted mt-1">Protect your learning data with local backups</p>
        </div>

        {/* Hidden file input for restore */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={onFileChange}
          className="hidden"
        />

        {/* Storage Overview */}
        <div className="glass-card rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">Storage Overview</h3>
            <span className="text-xs text-muted">{formatBytes(bytes)} used</span>
          </div>
          <div className="h-3 bg-elevated rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${storagePercent}%` }} />
          </div>
          <p className="text-[11px] text-muted">
            Data is stored in this browser's local storage on this device. Export regularly to keep a copy safe.
          </p>
        </div>

        {/* Backup Actions */}
        <div className="glass-card rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-text mb-4">Backup Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" 
              onClick={handleBackup}
              disabled={isBackingUp}
              className="flex items-center gap-3 p-4 rounded-xl bg-primary/15 hover:bg-primary/25 transition-colors text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                {isBackingUp ? (
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Download className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">
                  {isBackingUp ? 'Creating Backup...' : 'Download Backup'}
                </p>
                <p className="text-xs text-muted">Save a JSON snapshot to this device</p>
              </div>
            </button>
            
            <button type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 p-4 rounded-xl bg-elevated/50 hover:bg-elevated transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center">
                <Upload className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">Restore Backup</p>
                <p className="text-xs text-muted">Import a backup JSON file</p>
              </div>
            </button>

            <button type="button" 
              onClick={handleExportJSON}
              className="flex items-center gap-3 p-4 rounded-xl bg-elevated/50 hover:bg-elevated transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                <FileArchive className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">Export JSON</p>
                <p className="text-xs text-muted">Download all data as JSON</p>
              </div>
            </button>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-elevated/20 text-left opacity-70">
              <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center">
                <FileArchive className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">Export CSV</p>
                <p className="text-xs text-muted">Coming in a future update</p>
              </div>
            </div>
          </div>

          {feedback && (
            <div className={`mt-4 p-3 rounded-lg border flex items-center gap-2 ${
              feedback.kind === 'ok' 
                ? 'bg-success/15 border-success/30' 
                : 'bg-danger/15 border-danger/30'
            }`}>
              {feedback.kind === 'ok' 
                ? <CheckCircle2 className="w-4 h-4 text-success" />
                : <AlertCircle className="w-4 h-4 text-danger" />
              }
              <p className={`text-sm ${feedback.kind === 'ok' ? 'text-success' : 'text-danger'}`}>
                {feedback.text}
              </p>
            </div>
          )}
        </div>

        {/* Backup History */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">Backup History</h3>
            <span className="text-xs text-muted">{backups.length} backup{backups.length === 1 ? '' : 's'}</span>
          </div>
          {backups.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">No backups yet. Create one above.</p>
          ) : (
            <div className="space-y-2">
              {backups.map((backup, i) => (
                <div key={backup.id} className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30 hover:bg-elevated/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    i === 0 ? 'bg-primary/15' : 'bg-elevated/50'
                  }`}>
                    <FileArchive className={`w-4 h-4 ${i === 0 ? 'text-primary' : 'text-muted'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-text">{backup.date}</p>
                      {i === 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">Latest</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>{backup.time}</span>
                      <span>•</span>
                      <span>{backup.size}</span>
                      <span>•</span>
                      <span>{backup.files} items</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" 
                      onClick={() => handleRestoreRecord(backup)}
                      title="Restore this backup"
                      className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-success transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" 
                      onClick={() => downloadJSON(backup.payload, `learning-os-backup-${backup.date}.json`)}
                      title="Download this backup"
                      className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-text transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" 
                      onClick={() => handleDeleteRecord(backup.id)}
                      title="Delete this backup record"
                      className="p-1.5 rounded-lg hover:bg-danger/15 text-muted hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
