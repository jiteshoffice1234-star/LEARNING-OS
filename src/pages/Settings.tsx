import { useState } from 'react';
import { 
  Settings as SettingsIcon, Moon, Sun, Bell, Clock, Database, 
  Shield, Download, Upload, HardDrive, Trash2, ChevronRight,
  ToggleLeft, ToggleRight, Cloud, CloudOff, CheckCircle2, ExternalLink,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { usePersistentState, exportAll, clearAll, usedBytes, formatBytes } from '../lib/storage';
import { getCredentials, saveCredentials, isSupabaseConfigured } from '../lib/supabase';

export default function SettingsPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [theme, setTheme] = useTheme();
  const [notifications, setNotifications] = usePersistentState('settings:notifications', true);
  const [autoBackup, setAutoBackup] = usePersistentState('settings:autoBackup', true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Supabase cloud connection (stored in this browser; editable any time).
  const savedCreds = getCredentials();
  const [sbUrl, setSbUrl] = useState(savedCreds?.url ?? '');
  const [sbKey, setSbKey] = useState(savedCreds?.anonKey ?? '');
  const [sbStatus, setSbStatus] = useState<string | null>(null);
  const connected = isSupabaseConfigured();

  const handleSaveSupabase = () => {
    if (!sbUrl.trim() || !sbKey.trim()) {
      setSbStatus('Enter both the Project URL and the anon key.');
      return;
    }
    saveCredentials(sbUrl, sbKey);
    setSbStatus('Connected. Uploads now go to Supabase Storage.');
  };

  const handleDisconnectSupabase = () => {
    saveCredentials('', '');
    setSbUrl('');
    setSbKey('');
    setSbStatus('Disconnected. Uploads will save to this browser only.');
  };

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

  const handleBackup = () => {
    downloadJSON(exportAll(), `learning-os-backup-${new Date().toISOString().split('T')[0]}.json`);
    setStatus('Backup downloaded.');
    window.setTimeout(() => setStatus(null), 3000);
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setStatus('Click "Delete All Data" again to confirm.');
      window.setTimeout(() => setConfirmClear(false), 5000);
      return;
    }
    clearAll();
    setConfirmClear(false);
    setStatus('All data deleted. The app will reload with demo data.');
    window.setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Settings</h1>
          <p className="text-sm text-muted mt-1">Customize your learning experience</p>
        </div>

        {/* Appearance */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" />
            Appearance
          </h2>
          <div className="glass-card rounded-xl divide-y divide-border/50">
            <SettingRow
              icon={theme === 'dark' ? Moon : Sun}
              label="Dark Mode"
              description={theme === 'dark' ? 'Dark theme is active' : 'Switch to dark theme'}
              value={theme === 'dark' ? 'Active' : 'Inactive'}
            />
            <SettingRow
              icon={theme === 'light' ? Sun : Moon}
              label="Light Mode"
              description={theme === 'light' ? 'Light theme is active' : 'Switch to light theme'}
              value={theme === 'light' ? 'Active' : 'Inactive'}
            />
            <SettingRow
              icon={theme === 'claude' ? Sparkles : Sparkles}
              label="Claude Mode"
              description="Deep slate with amber accent — inspired by Claude"
              value={theme === 'claude' ? 'Active' : 'Inactive'}
            />
            <div className="flex gap-1 p-4 bg-elevated/30">
              {(['dark', 'light', 'claude'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === t
                      ? t === 'claude'
                        ? 'bg-amber-500 text-white'
                        : t === 'dark'
                        ? 'bg-primary text-white'
                        : 'bg-surface text-text'
                      : 'bg-elevated/50 text-muted hover:bg-elevated/80'
                  }`}
                >
                  {t === 'dark' ? 'Dark' : t === 'light' ? 'Light' : 'Claude'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Regional */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Regional
          </h2>
          <div className="glass-card rounded-xl divide-y divide-border/50">
            <SettingRow 
              icon={Clock}
              label="Week Start"
              description="First day of the week"
              value="Monday"
            />
            <SettingRow 
              icon={Clock}
              label="Date Format"
              description="How dates are displayed"
              value="DD/MM/YYYY"
            />
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Notifications
          </h2>
          <div className="glass-card rounded-xl divide-y divide-border/50">
            <SettingRow 
              icon={Bell}
              label="Push Notifications"
              description="Receive reminders and alerts"
              toggle={notifications}
              onToggle={() => setNotifications(!notifications)}
            />
            <SettingRow 
              icon={Clock}
              label="Study Reminders"
              description="Daily study time reminders"
              value="9:00 AM"
            />
            <SettingRow 
              icon={Bell}
              label="Revision Alerts"
              description="Alert before revision due dates"
              value="1 day before"
            />
          </div>
        </section>

        {/* Study Preferences */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-primary" />
            Study Preferences
          </h2>
          <div className="glass-card rounded-xl divide-y divide-border/50">
            <SettingRow 
              icon={Clock}
              label="Daily Study Target"
              description="Your daily study hour goal"
              value="4 hours"
            />
            <SettingRow 
              icon={Clock}
              label="Focus Session Duration"
              description="Default timer duration"
              value="50 minutes"
            />
            <SettingRow 
              icon={Clock}
              label="Break Duration"
              description="Time between focus sessions"
              value="10 minutes"
            />
          </div>
        </section>

        {/* Cloud Storage (Supabase) */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
            {connected ? <Cloud className="w-4 h-4 text-success" /> : <CloudOff className="w-4 h-4 text-primary" />}
            Cloud Storage
          </h2>
          <div className="glass-card rounded-xl p-5">
            <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-xs ${
              connected ? 'bg-success/10 text-success border border-success/20' : 'bg-elevated/50 text-muted'
            }`}>
              {connected ? <CheckCircle2 className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
              {connected
                ? 'Connected to Supabase — PDFs and images upload to the cloud.'
                : 'Not connected. Uploads stay in this browser (max 1.5 MB). Connect Supabase to store files in the cloud — free tier.'}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Project URL</label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={sbUrl}
                  onChange={(e) => setSbUrl(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Anon / Public Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={sbKey}
                  onChange={(e) => setSbKey(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSaveSupabase}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {connected ? 'Update Connection' : 'Connect Supabase'}
                </button>
                {connected && (
                  <button
                    onClick={handleDisconnectSupabase}
                    className="px-4 py-2 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors"
                  >
                    Disconnect
                  </button>
                )}
                <a
                  href="https://supabase.com/dashboard/project/_/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:text-accent transition-colors"
                >
                  Find these in the Supabase dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {sbStatus && <p className="text-xs text-primary">{sbStatus}</p>}

              <p className="text-[11px] text-muted leading-relaxed">
                One-time setup in Supabase: open <span className="text-text">Storage</span> and create a
                <span className="text-text"> public bucket named “vault”</span>. Then uploads (PDF, JPG, PNG) work automatically.
                Keys are stored only in this browser and are included in your backups.
              </p>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Data Management
          </h2>
          <div className="glass-card rounded-xl divide-y divide-border/50">
            <SettingRow 
              icon={HardDrive}
              label="Storage Used"
              description="Local data in this browser"
              value={formatBytes(usedBytes())}
            />
            <button type="button" 
              onClick={handleBackup}
              className="w-full flex items-center gap-3 p-4 hover:bg-elevated/30 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                <Download className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text">Backup Data</p>
                <p className="text-xs text-muted">Download all data as a JSON file</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </button>
            <button type="button" 
              onClick={() => onNavigate?.('backup')}
              className="w-full flex items-center gap-3 p-4 hover:bg-elevated/30 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text">Restore Data</p>
                <p className="text-xs text-muted">Import from a backup file</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </button>
            <button type="button" 
              onClick={handleClearAll}
              className="w-full flex items-center gap-3 p-4 hover:bg-elevated/30 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text">{confirmClear ? 'Confirm: Delete Everything' : 'Delete All Data'}</p>
                <p className="text-xs text-muted">{confirmClear ? 'Click again to permanently erase' : 'Erase all data stored in this browser'}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </button>
            {status && (
              <div className="p-4">
                <p className="text-xs text-primary">{status}</p>
              </div>
            )}
          </div>
        </section>

        {/* Security */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Security
          </h2>
          <div className="glass-card rounded-xl divide-y divide-border/50">
            <SettingRow 
              icon={Shield}
              label="Offline Storage"
              description="All data stays on this device — no cloud sync"
              value="Always on"
            />
            <SettingRow 
              icon={Shield}
              label="No Tracking"
              description="The app collects no analytics or personal data"
              value="Always on"
            />
            <SettingRow 
              icon={Shield}
              label="Biometric Lock"
              description="Use fingerprint or face ID"
              value="Not available"
            />
          </div>
        </section>

        {/* Auto Backup */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Backup
          </h2>
          <div className="glass-card rounded-xl divide-y divide-border/50">
            <SettingRow 
              icon={Database}
              label="Auto Backup"
              description="Remind me to back up regularly"
              toggle={autoBackup}
              onToggle={() => setAutoBackup(!autoBackup)}
            />
            <SettingRow 
              icon={HardDrive}
              label="Backup Location"
              description="Where backups are saved"
              value="Your device (download)"
            />
          </div>
        </section>

        {/* About */}
        <section className="mb-8">
          <div className="glass-card rounded-xl p-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-bold gradient-text">LEARNING OS</h3>
            <p className="text-xs text-muted mt-1">Version 1.0.0</p>
            <p className="text-xs text-muted mt-3">Your device is the home of your learning data.</p>
            <p className="text-xs text-muted mt-1">Offline-first • No cloud required • Your data stays local</p>
          </div>
        </section>
      </div>
    </div>
  );
}

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description: string;
  toggle?: boolean;
  onToggle?: () => void;
  value?: string;
}

function SettingRow({ icon: Icon, label, description, toggle, onToggle, value }: SettingRowProps) {
  return (
    <div className="flex items-center gap-3 p-4 hover:bg-elevated/30 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      {toggle !== undefined ? (
        <button type="button" onClick={onToggle} className="flex-shrink-0">
          {toggle ? (
            <ToggleRight className="w-8 h-8 text-primary" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-muted" />
          )}
        </button>
      ) : (
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-sm text-muted">{value}</span>
          <ChevronRight className="w-4 h-4 text-muted" />
        </div>
      )}
    </div>
  );
}
