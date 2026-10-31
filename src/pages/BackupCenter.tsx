import { useState } from 'react';
import { 
  Database, Download, Upload, HardDrive, Shield, Clock, 
  CheckCircle2, AlertCircle, FileArchive, Trash2, RefreshCw, Lock
} from 'lucide-react';

interface Backup {
  id: string;
  date: string;
  time: string;
  size: string;
  type: 'auto' | 'manual';
  encrypted: boolean;
  files: number;
}

const backups: Backup[] = [
  { id: '1', date: '2026-10-31', time: '14:30', size: '12.4 MB', type: 'auto', encrypted: false, files: 47 },
  { id: '2', date: '2026-10-30', time: '14:30', size: '12.1 MB', type: 'auto', encrypted: false, files: 45 },
  { id: '3', date: '2026-10-29', time: '09:15', size: '11.8 MB', type: 'manual', encrypted: true, files: 43 },
  { id: '4', date: '2026-10-28', time: '14:30', size: '11.5 MB', type: 'auto', encrypted: false, files: 42 },
  { id: '5', date: '2026-10-27', time: '14:30', size: '11.2 MB', type: 'auto', encrypted: false, files: 40 },
];

export default function BackupCenter() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupComplete, setBackupComplete] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setBackupComplete(true);
      setTimeout(() => setBackupComplete(false), 3000);
    }, 2000);
  };

  const storageUsed = 12.4;
  const storageTotal = 100;
  const storagePercent = (storageUsed / storageTotal) * 100;

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Backup Center</h1>
          <p className="text-sm text-muted mt-1">Protect your learning data with local backups</p>
        </div>

        {/* Storage Overview */}
        <div className="glass-card rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">Storage Overview</h3>
            <span className="text-xs text-muted">{storageUsed} MB / {storageTotal} MB</span>
          </div>
          <div className="h-3 bg-elevated rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${storagePercent}%` }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-2 rounded-lg bg-elevated/30">
              <Database className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs font-medium text-text">4.2 MB</p>
              <p className="text-[10px] text-muted">Database</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-elevated/30">
              <FileArchive className="w-4 h-4 text-success mx-auto mb-1" />
              <p className="text-xs font-medium text-text">6.8 MB</p>
              <p className="text-[10px] text-muted">Documents</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-elevated/30">
              <HardDrive className="w-4 h-4 text-warning mx-auto mb-1" />
              <p className="text-xs font-medium text-text">1.2 MB</p>
              <p className="text-[10px] text-muted">Thumbnails</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-elevated/30">
              <FileArchive className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-xs font-medium text-text">0.2 MB</p>
              <p className="text-[10px] text-muted">Exports</p>
            </div>
          </div>
        </div>

        {/* Backup Actions */}
        <div className="glass-card rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-text mb-4">Backup Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
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
                  {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
                </p>
                <p className="text-xs text-muted">Full ZIP archive with all data</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 rounded-xl bg-elevated/50 hover:bg-elevated transition-colors text-left">
              <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center">
                <Upload className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">Restore Backup</p>
                <p className="text-xs text-muted">Import from backup file</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 rounded-xl bg-elevated/50 hover:bg-elevated transition-colors text-left">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                <FileArchive className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">Export JSON</p>
                <p className="text-xs text-muted">Database as JSON file</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 rounded-xl bg-elevated/50 hover:bg-elevated transition-colors text-left">
              <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center">
                <FileArchive className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">Export CSV</p>
                <p className="text-xs text-muted">Data as CSV files</p>
              </div>
            </button>
          </div>

          {backupComplete && (
            <div className="mt-4 p-3 rounded-lg bg-success/15 border border-success/30 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <p className="text-sm text-success">Backup created successfully!</p>
            </div>
          )}
        </div>

        {/* Encryption */}
        <div className="glass-card rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-text">Encryption</h3>
            </div>
            <button 
              onClick={() => setEncryptionEnabled(!encryptionEnabled)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                encryptionEnabled ? 'bg-success/15 text-success' : 'bg-elevated text-muted'
              }`}
            >
              {encryptionEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <p className="text-xs text-muted mb-3">
            {encryptionEnabled 
              ? 'Backups will be encrypted with AES-256. You will need a password to restore.'
              : 'Enable encryption to password-protect your backup files.'
            }
          </p>
          {encryptionEnabled && (
            <div className="p-3 rounded-lg bg-elevated/50 border border-border/50">
              <label className="text-xs text-muted block mb-1.5">Encryption Password</label>
              <input 
                type="password" 
                placeholder="Enter password" 
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </div>

        {/* Backup History */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">Backup History</h3>
            <span className="text-xs text-muted">{backups.length} backups</span>
          </div>
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
                    <span>{backup.files} files</span>
                    {backup.encrypted && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-success">
                          <Lock className="w-3 h-3" /> Encrypted
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-text transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-danger/15 text-muted hover:text-danger transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Backup Settings */}
        <div className="glass-card rounded-xl p-5 mt-6">
          <h3 className="text-sm font-semibold text-text mb-4">Auto Backup Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-elevated/30">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted" />
                <span className="text-sm text-text">Frequency</span>
              </div>
              <select className="bg-elevated border border-border rounded-lg px-2 py-1 text-xs text-text focus:outline-none focus:border-primary">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-elevated/30">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-muted" />
                <span className="text-sm text-text">Max Backups</span>
              </div>
              <select className="bg-elevated border border-border rounded-lg px-2 py-1 text-xs text-text focus:outline-none focus:border-primary">
                <option>7 days</option>
                <option>14 days</option>
                <option>30 days</option>
                <option>Unlimited</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
