import { useState } from 'react';
import { 
  Settings as SettingsIcon, Moon, Sun, Bell, Clock, Database, 
  Shield, Download, Upload, HardDrive, Trash2, ChevronRight,
  ToggleLeft, ToggleRight
} from 'lucide-react';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [encryption, setEncryption] = useState(false);

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
            <Moon className="w-4 h-4 text-primary" />
            Appearance
          </h2>
          <div className="glass-card rounded-xl divide-y divide-border/50">
            <SettingRow 
              icon={darkMode ? Moon : Sun}
              label="Dark Mode"
              description="Use dark theme throughout the app"
              toggle={darkMode}
              onToggle={() => setDarkMode(!darkMode)}
            />
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
              description="Local database and files"
              value="12.4 MB"
            />
            <div className="flex items-center gap-3 p-4 hover:bg-elevated/30 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                <Download className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text">Backup Data</p>
                <p className="text-xs text-muted">Export all data as encrypted archive</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </div>
            <div className="flex items-center gap-3 p-4 hover:bg-elevated/30 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text">Restore Data</p>
                <p className="text-xs text-muted">Import from backup file</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </div>
            <div className="flex items-center gap-3 p-4 hover:bg-elevated/30 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text">Clear Cache</p>
                <p className="text-xs text-muted">Remove temporary files (3.2 MB)</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted" />
            </div>
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
              label="App Lock"
              description="Require authentication to open app"
              toggle={false}
              onToggle={() => {}}
            />
            <SettingRow 
              icon={Shield}
              label="Encrypt Backup"
              description="Password-protect backup files"
              toggle={encryption}
              onToggle={() => setEncryption(!encryption)}
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
              description="Automatically backup data daily"
              toggle={autoBackup}
              onToggle={() => setAutoBackup(!autoBackup)}
            />
            <SettingRow 
              icon={Clock}
              label="Last Backup"
              description="Most recent backup timestamp"
              value="Today, 2:30 PM"
            />
            <SettingRow 
              icon={HardDrive}
              label="Backup Location"
              description="Where backups are stored"
              value="Local Storage"
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
        <button onClick={onToggle} className="flex-shrink-0">
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
