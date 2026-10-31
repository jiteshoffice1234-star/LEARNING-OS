import { useState, useEffect, useRef } from 'react';
import { 
  Search, LayoutDashboard, BookOpen, Timer, Calendar, Brain, 
  BarChart3, Settings, Award, FileText, Target, Plus, 
  RotateCcw, GraduationCap, ChevronRight
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
  shortcut?: string;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Navigation
    { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => { onNavigate('dashboard'); onClose(); }, category: 'Navigation' },
    { id: 'nav-study', label: 'Go to Study Center', icon: BookOpen, action: () => { onNavigate('study'); onClose(); }, category: 'Navigation' },
    { id: 'nav-timer', label: 'Start Study Timer', icon: Timer, action: () => { onNavigate('timer'); onClose(); }, category: 'Navigation' },
    { id: 'nav-calendar', label: 'Open Calendar', icon: Calendar, action: () => { onNavigate('calendar'); onClose(); }, category: 'Navigation' },
    { id: 'nav-skills', label: 'View Skills', icon: Brain, action: () => { onNavigate('skills'); onClose(); }, category: 'Navigation' },
    { id: 'nav-analytics', label: 'View Analytics', icon: BarChart3, action: () => { onNavigate('analytics'); onClose(); }, category: 'Navigation' },
    { id: 'nav-vault', label: 'Open Vault', icon: Award, action: () => { onNavigate('vault'); onClose(); }, category: 'Navigation' },
    { id: 'nav-notes', label: 'Open Notes', icon: FileText, action: () => { onNavigate('notes'); onClose(); }, category: 'Navigation' },
    { id: 'nav-settings', label: 'Open Settings', icon: Settings, action: () => { onNavigate('settings'); onClose(); }, category: 'Navigation' },
    { id: 'nav-roadmap', label: 'View Roadmap', icon: Target, action: () => { onNavigate('roadmap'); onClose(); }, category: 'Navigation' },
    { id: 'nav-revisions', label: 'Revision Manager', icon: RotateCcw, action: () => { onNavigate('revisions'); onClose(); }, category: 'Navigation' },
    { id: 'nav-tests', label: 'Tests Center', icon: GraduationCap, action: () => { onNavigate('tests'); onClose(); }, category: 'Navigation' },
    { id: 'nav-qualifications', label: 'Qualifications', icon: GraduationCap, action: () => { onNavigate('qualifications'); onClose(); }, category: 'Navigation' },
    { id: 'nav-profile', label: 'Edit Profile', icon: LayoutDashboard, action: () => { onNavigate('profile'); onClose(); }, category: 'Navigation' },
    
    // Actions
    { id: 'action-new-course', label: 'New Course', icon: Plus, description: 'Create a new course', action: () => { onNavigate('study'); onClose(); }, category: 'Actions' },
    { id: 'action-new-session', label: 'Start Study Session', icon: Timer, description: 'Begin a focused study session', action: () => { onNavigate('timer'); onClose(); }, category: 'Actions' },
    { id: 'action-new-revision', label: 'Schedule Revision', icon: RotateCcw, description: 'Plan a revision session', action: () => { onNavigate('revisions'); onClose(); }, category: 'Actions' },
    { id: 'action-log-test', label: 'Log Test Result', icon: GraduationCap, description: 'Record a test score', action: () => { onNavigate('tests'); onClose(); }, category: 'Actions' },
    { id: 'action-upload', label: 'Upload Certificate', icon: Award, description: 'Add a new certificate to vault', action: () => { onNavigate('vault'); onClose(); }, category: 'Actions' },
    { id: 'action-new-note', label: 'Create Note', icon: FileText, description: 'Write a new study note', action: () => { onNavigate('notes'); onClose(); }, category: 'Actions' },
  ];

  const filtered = query.trim() === '' 
    ? commands 
    : commands.filter(c => 
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(query.toLowerCase()))
      );

  // Group by category
  const grouped = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  let globalIndex = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl glass-card rounded-2xl overflow-hidden animate-fade-in shadow-2xl shadow-primary/10">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Search className="w-5 h-5 text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-text placeholder:text-muted/50 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-elevated text-[10px] text-muted font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted">No results found</p>
              <p className="text-xs text-muted/60 mt-1">Try a different search term</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category} className="mb-2">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider px-3 py-1.5">{category}</p>
                {cmds.map((cmd) => {
                  const idx = globalIndex++;
                  const Icon = cmd.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isSelected ? 'bg-primary/15' : 'hover:bg-elevated/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-primary/20' : 'bg-elevated/50'
                      }`}>
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isSelected ? 'text-text' : 'text-text/80'}`}>{cmd.label}</p>
                        {cmd.description && <p className="text-xs text-muted truncate">{cmd.description}</p>}
                      </div>
                      {isSelected && <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 bg-surface/50">
          <div className="flex items-center gap-3 text-[10px] text-muted">
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-elevated font-mono">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-elevated font-mono">↵</kbd> Select</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-elevated font-mono">esc</kbd> Close</span>
          </div>
          <span className="text-[10px] text-muted">{filtered.length} commands</span>
        </div>
      </div>
    </div>
  );
}
