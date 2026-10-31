import { useState } from 'react';
import { 
  Home, BookOpen, Hammer, Compass, Brain, 
  BarChart3, Settings, Award, FileText, Target,
  ChevronLeft, ChevronRight, Search, Bell, Plus,
  RotateCcw, GraduationCap, Map, User, Database,
  Timer, Inbox, Lightbulb, CheckSquare, Zap
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

// New 7-section navigation per spec
const navSections = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'inbox', label: 'Inbox', icon: Inbox },
    ],
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: BookOpen,
    items: [
      { id: 'study', label: 'Study Center', icon: BookOpen },
      { id: 'timer', label: 'Study Timer', icon: Timer },
      { id: 'revisions', label: 'Revisions', icon: RotateCcw },
      { id: 'tests', label: 'Tests', icon: GraduationCap },
      { id: 'flashcards', label: 'Flashcards', icon: Lightbulb },
    ],
  },
  {
    id: 'build',
    label: 'Build',
    icon: Hammer,
    items: [
      { id: 'tasks', label: 'Tasks', icon: CheckSquare },
      { id: 'projects', label: 'Projects', icon: Zap },
    ],
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: Compass,
    items: [
      { id: 'calendar', label: 'Calendar', icon: Compass },
      { id: 'roadmap', label: 'Roadmap', icon: Map },
      { id: 'goals', label: 'Goals', icon: Target },
    ],
  },
  {
    id: 'remember',
    label: 'Remember',
    icon: Brain,
    items: [
      { id: 'knowledge', label: 'Knowledge', icon: Brain },
      { id: 'skills', label: 'Skills', icon: Brain },
      { id: 'vault', label: 'Vault', icon: Award },
      { id: 'notes', label: 'Notes', icon: FileText },
    ],
  },
  {
    id: 'measure',
    label: 'Measure',
    icon: BarChart3,
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'qualifications', label: 'Qualifications', icon: GraduationCap },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: Settings,
    items: [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'backup', label: 'Backup', icon: Database },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('home');

  // Determine which section the current page belongs to
  const currentSection = navSections.find(s => s.items.some(i => i.id === currentPage))?.id || 'home';

  const handleSectionClick = (sectionId: string) => {
    if (expandedSection === sectionId) {
      // If clicking the same section, navigate to its first item
      const section = navSections.find(s => s.id === sectionId);
      if (section && section.items.length > 0) {
        onNavigate(section.items[0].id);
      }
    } else {
      setExpandedSection(sectionId);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col transition-all duration-300 ease-in-out border-r border-border ${collapsed ? 'w-16' : 'w-64'} bg-surface`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight gradient-text block leading-tight">LEARNING OS</span>
                <span className="text-[9px] text-muted tracking-wider">v1.0</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-primary/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-elevated text-muted hover:text-text transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navSections.map((section) => {
            const SectionIcon = section.icon;
            const isActive = currentSection === section.id;
            const isExpanded = expandedSection === section.id;
            
            return (
              <div key={section.id} className="mb-1">
                <button
                  onClick={() => collapsed ? handleSectionClick(section.id) : setExpandedSection(isExpanded ? null : section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-primary/15 text-primary' 
                      : 'text-muted hover:text-text hover:bg-elevated/50'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? section.label : undefined}
                >
                  <SectionIcon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{section.label}</span>
                      {!collapsed && (
                        <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      )}
                    </>
                  )}
                </button>
                
                {/* Sub-items */}
                {!collapsed && isExpanded && (
                  <div className="mt-0.5 ml-4 pl-3 border-l border-border/50 space-y-0.5">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isItemActive = currentPage === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onNavigate(item.id)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                            isItemActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted hover:text-text hover:bg-elevated/30'
                          }`}
                        >
                          <ItemIcon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        {!collapsed && (
          <div className="p-3 border-t border-border">
            <button 
              onClick={() => onNavigate('profile')}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-elevated/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                A
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-text truncate">Arjun K.</p>
                <p className="text-[10px] text-muted truncate">🔥 42 day streak</p>
              </div>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface border-r border-border flex flex-col">
            <div className="flex items-center justify-between p-4 h-16 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <span className="font-bold text-sm tracking-tight gradient-text">LEARNING OS</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md hover:bg-elevated text-muted">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
              {navSections.map((section) => {
                const SectionIcon = section.icon;
                const isActive = currentSection === section.id;
                return (
                  <div key={section.id}>
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text hover:bg-elevated/50'
                      }`}
                    >
                      <SectionIcon className="w-[18px] h-[18px]" />
                      <span className="flex-1 text-left">{section.label}</span>
                    </button>
                    {expandedSection === section.id && (
                      <div className="ml-6 mt-0.5 space-y-0.5">
                        {section.items.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                                currentPage === item.id ? 'text-primary' : 'text-muted hover:text-text'
                              }`}
                            >
                              <ItemIcon className="w-3.5 h-3.5" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button 
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-elevated text-muted"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <button 
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                window.dispatchEvent(event);
              }}
              className="flex-1 flex items-center gap-2 bg-elevated/50 rounded-lg px-3 py-2 border border-border/50 hover:border-primary/30 transition-colors max-w-md"
            >
              <Search className="w-4 h-4 text-muted" />
              <span className="text-sm text-muted flex-1 text-left">Search or command...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-elevated text-[10px] text-muted font-mono">
                ⌘K
              </kbd>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate('inbox')}
              className="p-2 rounded-lg hover:bg-elevated text-muted hover:text-text transition-colors relative"
              title="Quick Capture"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-elevated text-muted hover:text-text transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border flex items-center justify-around px-2 z-40">
        {[
          { id: 'dashboard', icon: Home, label: 'Home' },
          { id: 'study', icon: BookOpen, label: 'Learn' },
          { id: 'tasks', icon: Hammer, label: 'Build' },
          { id: 'calendar', icon: Compass, label: 'Plan' },
          { id: 'analytics', icon: BarChart3, label: 'More' },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || 
            (item.id === 'dashboard' && ['dashboard', 'inbox'].includes(currentPage)) ||
            (item.id === 'study' && ['study', 'timer', 'revisions', 'tests', 'flashcards'].includes(currentPage)) ||
            (item.id === 'tasks' && ['tasks', 'projects'].includes(currentPage)) ||
            (item.id === 'calendar' && ['calendar', 'roadmap', 'goals'].includes(currentPage)) ||
            (item.id === 'analytics' && ['analytics', 'qualifications', 'knowledge', 'skills', 'vault', 'notes', 'profile', 'backup', 'settings'].includes(currentPage));
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
