import { useState } from 'react';
import {
  Settings as SettingsIcon, Moon, Sun, Bell, Clock, Database,
  Shield, Download, Upload, HardDrive, Trash2, ChevronRight,
  ToggleLeft, ToggleRight, CheckCircle2, Github, CloudOff, Target,
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { usePersistentState, exportAll, clearAll, usedBytes, formatBytes } from '../lib/storage';
import { getGitHubConfig, saveGitHubConfig, isGitHubConfigured, testGitHubConnection } from '../lib/githubFiles';
import ConfirmDialog from '../components/ConfirmDialog';

export default function SettingsPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [theme, setTheme] = useTheme();
  const [notifications, setNotifications] = usePersistentState('settings:notifications', true);
  const [dailyTarget, setDailyTarget] = usePersistentState('settings:dailyTarget', 4);
  const [confirmClear, setConfirmClear] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // GitHub cloud connection (stored in this browser; editable any time).
  const savedCreds = getGitHubConfig();
  const [ghToken, setGhToken] = useState(savedCreds?.token ?? '');
  const [ghOwner, setGhOwner] = useState(savedCreds?.owner ?? '');
  const [ghRepo, setGhRepo] = useState(savedCreds?.repo ?? '');
  const [ghBranch, setGhBranch] = useState(savedCreds?.branch ?? 'main');
  const [ghFolder, setGhFolder] = useState(savedCreds?.folder ?? 'vault');
  const [ghStatus, setGhStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [ghTesting, setGhTesting] = useState(false);
  const ghConfigured = isGitHubConfigured();

  const flash = (text: string) => {
    setStatus(text);
    window.setTimeout(() => setStatus(null), 4000);
  };

  const handleSaveGitHub = async () => {
    if (!ghToken.trim() || !ghOwner.trim() || !ghRepo.trim()) {
      setGhStatus({ kind: 'error', text: 'Token, owner, and repository are required.' });
      return;
    }
    saveGitHubConfig({
      token: ghToken.trim(),
      owner: ghOwner.trim(),
      repo: ghRepo.trim(),
      branch: ghBranch.trim() || 'main',
      folder: ghFolder.trim() || 'vault',
    });
    setGhTesting(true);
    const result = await testGitHubConnection();
    setGhTesting(false);
    setGhStatus({ kind: result.ok ? 'ok' : 'error', text: result.message });
  };

  const handleTestGitHub = async () => {
    setGhTesting(true);
    setGhStatus(null);
    const result = await testGitHubConnection();
    setGhTesting(false);
    setGhStatus({ kind: result.ok ? 'ok' : 'error', text: result.message });
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
    flash('Backup downloaded.');
  };

  const handleClearAll = () => {
    clearAll();
    setConfirmClear(false);
    flash('All learning data deleted. Your settings and GitHub connection were kept.');
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
          <div className="glass-card rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                    theme === t
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-elevated/40 hover:bg-elevated/70'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    theme === t ? 'bg-primary/20 text-primary' : 'bg-elevated text-muted'
                  }`}>
                    {t === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">{t === 'dark' ? 'Dark' : 'Light'}</p>
                    <p className="text-[10px] text-muted">
                      {t === 'dark' ? 'Default low-light theme' : 'Bright theme for daytime'}
                    </p>
                  </div>
                  {theme === t && <CheckCircle2 className="w-4 h-4 text-primary ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
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
              label="Reminders & Alerts"
              description="Show overdue revisions and due tasks in the top bar"
              toggle={notifications}
              onToggle={() => setNotifications(!notifications)}
            />
          </div>
        </section>

        {/* Study Preferences */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Study Preferences
          </h2>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text">Daily Study Target</p>
                <p className="text-xs text-muted">Used for your daily progress ring</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0.5}
                  max={16}
                  step={0.5}
                  value={dailyTarget}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (Number.isFinite(next)) {
                      setDailyTarget(Math.min(16, Math.max(0.5, next)));
                    }
                  }}
                  aria-label="Daily study target in hours"
                  className="w-20 bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text text-center focus:outline-none focus:border-primary"
                />
                <span className="text-xs text-muted">hours</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cloud Storage (GitHub) */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
            {ghConfigured ? <Github className="w-4 h-4 text-success" /> : <CloudOff className="w-4 h-4 text-primary" />}
            Cloud Storage (GitHub)
          </h2>
          <div className="glass-card rounded-xl p-5">
            <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-xs ${
              ghConfigured ? 'bg-success/10 text-success border border-success/20' : 'bg-elevated/50 text-muted'
            }`}>
              {ghConfigured ? <CheckCircle2 className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
              {ghConfigured
                ? 'Connected to GitHub — uploads are stored in your GitHub repo.'
                : 'Not connected. Connect GitHub to store uploaded files in your repo.'}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Personal Access Token</label>
                <input
                  type="password"
                  placeholder="ghp_..."
                  value={ghToken}
                  onChange={(e) => setGhToken(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                />
                <p className="text-[11px] text-muted mt-1">Create at github.com/settings/tokens with repo scope.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Owner</label>
                  <input
                    type="text"
                    placeholder="jiteshoffice1234-star"
                    value={ghOwner}
                    onChange={(e) => setGhOwner(e.target.value)}
                    className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Repository</label>
                  <input
                    type="text"
                    placeholder="LEARNING-OS"
                    value={ghRepo}
                    onChange={(e) => setGhRepo(e.target.value)}
                    className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Branch</label>
                  <input
                    type="text"
                    placeholder="main"
                    value={ghBranch}
                    onChange={(e) => setGhBranch(e.target.value)}
                    className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Folder</label>
                  <input
                    type="text"
                    placeholder="vault"
                    value={ghFolder}
                    onChange={(e) => setGhFolder(e.target.value)}
                    className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSaveGitHub}
                  disabled={ghTesting}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {ghTesting ? 'Checking…' : 'Save Connection'}
                </button>
                <button
                  onClick={handleTestGitHub}
                  disabled={ghTesting}
                  className="px-4 py-2 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors disabled:opacity-60"
                >
                  Test Connection
                </button>
              </div>

              {ghStatus && (
                <p className={`text-xs break-words ${ghStatus.kind === 'ok' ? 'text-success' : 'text-danger'}`}>
                  {ghStatus.text}
                </p>
              )}

              <p className="text-[11px] text-muted leading-relaxed">
                Uploaded files are stored in your GitHub repo at <span className="text-text">/{ghFolder}</span> on branch{' '}
                <span className="text-text">{ghBranch}</span>. The token is saved only in this browser. Files on a public repo
                can be viewed by anyone with the link.
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
            <SettingRow icon={HardDrive} label="Storage Used" description="Local data in this browser" value={formatBytes(usedBytes())} />
            <button onClick={handleBackup} className="w-full flex items-center gap-3 p-4 hover:bg-elevated/30 transition-colors text-left">
              <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center"><Download className="w-4 h-4 text-success" /></div>
              <div className="flex-1">
                <p className="text-sm text-text">Backup Data</p>
                <p className="text-xs text-muted">Download all data as a JSON file</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </button>
            <button onClick={() => onNavigate?.('backup')} className="w-full flex items-center gap-3 p-4 hover:bg-elevated/30 transition-colors text-left">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center"><Upload className="w-4 h-4 text-primary" /></div>
              <div className="flex-1">
                <p className="text-sm text-text">Restore Data</p>
                <p className="text-xs text-muted">Import from a backup file</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </button>
            <button onClick={() => setConfirmClear(true)} className="w-full flex items-center gap-3 p-4 hover:bg-elevated/30 transition-colors text-left">
              <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center"><Trash2 className="w-4 h-4 text-danger" /></div>
              <div className="flex-1">
                <p className="text-sm text-text">Delete All Data</p>
                <p className="text-xs text-muted">Erase all learning data stored in this browser</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </button>
            {status && (<div className="p-4"><p className="text-xs text-primary">{status}</p></div>)}
          </div>
        </section>

        {/* Security */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Security
          </h2>
          <div className="glass-card rounded-xl divide-y divide-border/50">
            <SettingRow icon={Shield} label="Offline Storage" description="All data stays on this device — no cloud sync" value="Always on" />
            <SettingRow icon={Shield} label="No Tracking" description="The app collects no analytics or personal data" value="Always on" />
          </div>
        </section>

        {/* About */}
        <section className="mb-8">
          <div className="glass-card rounded-xl p-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3"><SettingsIcon className="w-6 h-6 text-primary" /></div>
            <h3 className="text-sm font-bold gradient-text">LEARNING OS</h3>
            <p className="text-xs text-muted mt-1">Version 1.0.0</p>
            <p className="text-xs text-muted mt-3">Your device is the home of your learning data.</p>
            <p className="text-xs text-muted mt-1">Offline-first • No cloud required • Your data stays local</p>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Delete all learning data?"
        message="This permanently erases your courses, sessions, tests, notes, goals and files from this browser. Your theme, daily target and GitHub connection are kept. This cannot be undone."
        confirmLabel="Delete Everything"
        onConfirm={handleClearAll}
        onClose={() => setConfirmClear(false)}
      />
    </div>
  );
}

interface SettingRowProps { icon: React.ElementType; label: string; description: string; toggle?: boolean; onToggle?: () => void; value?: string; }

function SettingRow({ icon: Icon, label, description, toggle, onToggle, value }: SettingRowProps) {
  return (
    <div className="flex items-center gap-3 p-4 hover:bg-elevated/30 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      {toggle !== undefined ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={`${toggle ? 'Disable' : 'Enable'} ${label}`}
          aria-pressed={toggle}
          className="flex-shrink-0"
        >
          {toggle ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-muted" />}
        </button>
      ) : (
        <span className="flex-shrink-0 text-sm text-muted">{value}</span>
      )}
    </div>
  );
}
