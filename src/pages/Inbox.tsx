import { useState } from 'react';
import { 
  Inbox as InboxIcon, Plus, Type, Image, FileText, Link2, Mic,
  CheckCircle2, Clock, Archive, ChevronRight, X, Send, Tag
} from 'lucide-react';

interface Capture {
  id: string;
  type: 'text' | 'image' | 'document' | 'link' | 'voice';
  content: string;
  title?: string;
  timestamp: string;
  status: 'new' | 'reviewing' | 'organized' | 'archived';
  tags: string[];
  convertTo?: string;
}

const initialCaptures: Capture[] = [
  { id: '1', type: 'text', content: 'Idea: Build a spaced repetition algorithm that adapts to user performance patterns', title: 'SRS Algorithm Idea', timestamp: '2026-10-31 09:15', status: 'new', tags: ['idea', 'algorithm'] },
  { id: '2', type: 'link', content: 'https://arxiv.org/abs/2301.00234', title: 'Attention Is All You Need - Paper', timestamp: '2026-10-31 08:30', status: 'new', tags: ['research', 'ml'] },
  { id: '3', type: 'image', content: 'Screenshot of whiteboard session on system design', title: 'System Design Notes', timestamp: '2026-10-30 16:45', status: 'reviewing', tags: ['design', 'notes'] },
  { id: '4', type: 'document', content: 'ML_Course_Certificate.pdf', title: 'TensorFlow Certificate', timestamp: '2026-10-30 14:20', status: 'organized', tags: ['certificate'] },
  { id: '5', type: 'text', content: 'Remember to review chapter 5 of DDIA before Friday revision', title: 'Revision Reminder', timestamp: '2026-10-30 11:00', status: 'reviewing', tags: ['revision', 'reminder'] },
  { id: '6', type: 'voice', content: 'Voice note: 2:34 - Thoughts on distributed consensus algorithms', title: 'Voice Memo', timestamp: '2026-10-29 20:15', status: 'organized', tags: ['voice', 'notes'] },
  { id: '7', type: 'link', content: 'https://github.com/awesome-self-taught', title: 'Awesome Self-Taught Resources', timestamp: '2026-10-29 15:30', status: 'archived', tags: ['resources', 'github'] },
];

const typeConfig = {
  text: { icon: Type, color: 'text-primary', bg: 'bg-primary/15', label: 'Text' },
  image: { icon: Image, color: 'text-success', bg: 'bg-success/15', label: 'Image' },
  document: { icon: FileText, color: 'text-warning', bg: 'bg-warning/15', label: 'Document' },
  link: { icon: Link2, color: 'text-accent', bg: 'bg-accent/15', label: 'Link' },
  voice: { icon: Mic, color: 'text-danger', bg: 'bg-danger/15', label: 'Voice' },
};

const statusConfig = {
  new: { label: 'New', color: 'text-primary', bg: 'bg-primary/15' },
  reviewing: { label: 'Reviewing', color: 'text-warning', bg: 'bg-warning/15' },
  organized: { label: 'Organized', color: 'text-success', bg: 'bg-success/15' },
  archived: { label: 'Archived', color: 'text-muted', bg: 'bg-elevated/50' },
};

export default function InboxPage() {
  const [captures, setCaptures] = useState(initialCaptures);
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewing' | 'organized' | 'archived'>('all');
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [selectedCapture, setSelectedCapture] = useState<Capture | null>(null);
  const [newCaptureType, setNewCaptureType] = useState<'text' | 'link'>('text');
  const [newCaptureContent, setNewCaptureContent] = useState('');
  const [newCaptureTitle, setNewCaptureTitle] = useState('');

  const filtered = filter === 'all' ? captures : captures.filter(c => c.status === filter);
  const newCount = captures.filter(c => c.status === 'new').length;

  const handleAddCapture = () => {
    if (!newCaptureContent.trim()) return;
    const newCapture: Capture = {
      id: Date.now().toString(),
      type: newCaptureType,
      content: newCaptureContent,
      title: newCaptureTitle || 'Untitled',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'new',
      tags: [],
    };
    setCaptures([newCapture, ...captures]);
    setNewCaptureContent('');
    setNewCaptureTitle('');
    setShowCaptureModal(false);
  };

  const handleStatusChange = (id: string, status: Capture['status']) => {
    setCaptures(captures.map(c => c.id === id ? { ...c, status } : c));
    if (selectedCapture?.id === id) {
      setSelectedCapture({ ...selectedCapture, status });
    }
  };

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <InboxIcon className="w-5 h-5 text-primary" />
            Inbox
          </h1>
          <p className="text-xs text-muted">Quick capture · {newCount} new</p>
        </div>
        <button 
          onClick={() => setShowCaptureModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Capture</span>
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[11px] text-text font-medium">{newCount}</span>
          <span className="text-[10px] text-muted">New</span>
        </div>
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-warning" />
          <span className="text-[11px] text-text font-medium">{captures.filter(c => c.status === 'reviewing').length}</span>
          <span className="text-[10px] text-muted">Review</span>
        </div>
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[11px] text-text font-medium">{captures.filter(c => c.status === 'organized').length}</span>
          <span className="text-[10px] text-muted">Organized</span>
        </div>
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-text font-medium">{captures.length}</span>
          <span className="text-[10px] text-muted">Total</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
        {(['all', 'new', 'reviewing', 'organized', 'archived'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
            }`}
          >
            {f} {f !== 'all' && `(${captures.filter(c => c.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Capture List */}
      <div className="space-y-1">
        {filtered.map((capture) => {
          const typeInfo = typeConfig[capture.type];
          const statusInfo = statusConfig[capture.status];
          const TypeIcon = typeInfo.icon;
          
          return (
            <div
              key={capture.id}
              onClick={() => setSelectedCapture(capture)}
              className="glass-card rounded-lg p-2 cursor-pointer hover:border-primary/30 transition-all group flex items-center gap-2"
            >
              <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
                <TypeIcon className={`w-3.5 h-3.5 ${typeInfo.color}`} />
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <h3 className="text-xs font-medium text-text truncate flex-1">{capture.title}</h3>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <span className="text-[10px] text-muted flex-shrink-0">{capture.timestamp.split(' ')[1]}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <InboxIcon className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-muted">No captures in this category</p>
          <button 
            onClick={() => setShowCaptureModal(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition-colors"
          >
            Capture something
          </button>
        </div>
      )}

      {/* Quick Capture Modal */}
      {showCaptureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCaptureModal(false)} />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">Quick Capture</h2>
              <button onClick={() => setShowCaptureModal(false)} className="p-1.5 rounded-lg hover:bg-elevated text-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type Selector */}
            <div className="flex items-center gap-2 mb-4">
              {(['text', 'link'] as const).map((type) => {
                const info = typeConfig[type];
                const Icon = info.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setNewCaptureType(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      newCaptureType === type ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {info.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title (optional)"
                value={newCaptureTitle}
                onChange={(e) => setNewCaptureTitle(e.target.value)}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
              />
              <textarea
                placeholder={newCaptureType === 'link' ? 'Paste URL here...' : 'What\'s on your mind?'}
                value={newCaptureContent}
                onChange={(e) => setNewCaptureContent(e.target.value)}
                rows={4}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary resize-none"
                autoFocus
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowCaptureModal(false)} className="flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleAddCapture}
                disabled={!newCaptureContent.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capture Detail Modal */}
      {selectedCapture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedCapture(null)} />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {(() => { const Icon = typeConfig[selectedCapture.type].icon; return <Icon className={`w-5 h-5 ${typeConfig[selectedCapture.type].color}`} />; })()}
                <h2 className="text-lg font-bold text-text">{selectedCapture.title}</h2>
              </div>
              <button onClick={() => setSelectedCapture(null)} className="p-1.5 rounded-lg hover:bg-elevated text-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-elevated/50">
                <p className="text-sm text-text">{selectedCapture.content}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted">
                <Clock className="w-3 h-3" />
                <span>{selectedCapture.timestamp}</span>
                <span>•</span>
                <span className={`px-1.5 py-0.5 rounded ${statusConfig[selectedCapture.status].bg} ${statusConfig[selectedCapture.status].color}`}>
                  {statusConfig[selectedCapture.status].label}
                </span>
              </div>

              {selectedCapture.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <Tag className="w-3 h-3 text-muted" />
                  {selectedCapture.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-elevated text-muted">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Convert To */}
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Convert to</p>
                <div className="grid grid-cols-3 gap-2">
                  {['Task', 'Note', 'Goal'].map(target => (
                    <button key={target} className="px-3 py-2 rounded-lg bg-elevated/50 text-xs text-text hover:bg-primary/15 hover:text-primary transition-colors">
                      {target}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              {selectedCapture.status === 'new' && (
                <button onClick={() => handleStatusChange(selectedCapture.id, 'reviewing')} className="flex-1 px-3 py-2 rounded-lg bg-warning/15 text-warning text-xs font-medium hover:bg-warning/25 transition-colors">
                  Start Review
                </button>
              )}
              {selectedCapture.status === 'reviewing' && (
                <button onClick={() => handleStatusChange(selectedCapture.id, 'organized')} className="flex-1 px-3 py-2 rounded-lg bg-success/15 text-success text-xs font-medium hover:bg-success/25 transition-colors">
                  <CheckCircle2 className="w-3 h-3 inline mr-1" /> Mark Organized
                </button>
              )}
              <button onClick={() => handleStatusChange(selectedCapture.id, 'archived')} className="flex-1 px-3 py-2 rounded-lg bg-elevated text-muted text-xs font-medium hover:bg-elevated/80 transition-colors">
                <Archive className="w-3 h-3 inline mr-1" /> Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
