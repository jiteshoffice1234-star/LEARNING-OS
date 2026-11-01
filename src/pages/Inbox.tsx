import { useEffect, useState } from 'react';
import { store, usePersistentState, isDataWiped } from '../lib/storage';
import Modal from '../components/Modal';
import { notes as seedNotes } from '../data/mockData';
import { 
  Inbox as InboxIcon, Plus, Type, Image, FileText, Link2, Mic,
  CheckCircle2, Clock, Archive, ChevronRight, Send, Tag
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

/** Mirrors the Task shape in src/pages/Tasks.tsx — stored under 'tasks'. */
interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  linkedTo?: string;
  createdAt: string;
}

/** Mirrors the Note shape in src/pages/Notes.tsx — stored under 'notes'. */
interface NoteItem {
  id: string;
  title: string;
  subject: string;
  date: string;
  tags: string[];
}

/** Mirrors the Goal shape in src/pages/Goals.tsx — stored under 'goals'. */
interface GoalItem {
  id: string;
  title: string;
  description: string;
  type: 'learning' | 'skill' | 'career' | 'personal';
  targetDate: string;
  progress: number;
  milestones: { title: string; completed: boolean }[];
  status: 'on-track' | 'at-risk' | 'completed';
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

const conversionTargets = ['Task', 'Note', 'Goal'] as const;
type ConversionTarget = (typeof conversionTargets)[number];

/**
 * Append an item to a store that belongs to another page.
 *
 * Tasks / Goals / Notes seed their own demo data the first time they mount,
 * so this page deliberately does NOT hold those keys with usePersistentState —
 * merely opening the Inbox would write an empty array and wipe their seeds.
 * We only write when a conversion actually happens, and prepend so the new
 * item shows at the top of the target page (matching how those pages add items).
 */
function appendToStore<T>(key: string, item: T, seed: T[] = []) {
  const existing = store.get<T[]>(key, seed);
  store.set(key, [item, ...existing]);
}

/** Bucket an inbox capture into one of the Goal types from its tags. */
function goalTypeFor(tags: string[]): GoalItem['type'] {
  if (tags.some((t) => ['career', 'certification', 'job', 'resume'].includes(t))) return 'career';
  if (tags.some((t) => ['skill', 'project', 'code', 'coding'].includes(t))) return 'skill';
  if (tags.some((t) => ['personal', 'health', 'fitness', 'life'].includes(t))) return 'personal';
  return 'learning';
}

export default function InboxPage() {
  const wiped = isDataWiped();
  const [captures, setCaptures] = usePersistentState<Capture[]>('captures', wiped ? [] : initialCaptures);
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewing' | 'organized' | 'archived'>('all');
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [selectedCapture, setSelectedCapture] = useState<Capture | null>(null);
  const [newCaptureType, setNewCaptureType] = useState<'text' | 'link'>('text');
  const [newCaptureContent, setNewCaptureContent] = useState('');
  const [newCaptureTitle, setNewCaptureTitle] = useState('');
  const [convertMsg, setConvertMsg] = useState<string | null>(null);

  // Show the confirmation briefly, then close the detail dialog.
  useEffect(() => {
    if (!convertMsg) return;
    const timer = setTimeout(() => {
      setConvertMsg(null);
      setSelectedCapture(null);
    }, 1600);
    return () => clearTimeout(timer);
  }, [convertMsg]);

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

  const closeDetail = () => {
    setSelectedCapture(null);
    setConvertMsg(null);
  };

  /** Create a real Task / Note / Goal from the open capture. */
  const handleConvert = (target: ConversionTarget) => {
    if (!selectedCapture || selectedCapture.convertTo) return;
    const capture = selectedCapture;
    const title = capture.title?.trim() || capture.content.slice(0, 60) || 'Untitled capture';
    const today = new Date().toISOString().split('T')[0];
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    if (target === 'Task') {
      appendToStore<TaskItem>('tasks', {
        id,
        title,
        description: capture.content,
        status: 'todo',
        priority: 'medium',
        tags: [...capture.tags],
        linkedTo: 'Inbox',
        createdAt: today,
      });
    } else if (target === 'Note') {
      // Seed with the Notes page demo data so it isn't wiped on a first write.
      appendToStore<NoteItem>('notes', {
        id,
        title,
        subject: capture.tags[0] || 'General',
        date: today,
        tags: [...capture.tags],
      }, seedNotes);
    } else {
      appendToStore<GoalItem>('goals', {
        id,
        title,
        description: capture.content || 'No description yet.',
        type: goalTypeFor(capture.tags),
        // Default to 90 days out (same convention as the Goals page).
        targetDate: new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10),
        progress: 0,
        milestones: [],
        status: 'on-track',
      });
    }

    // Remember the conversion on the capture so it can't be converted twice.
    const updated: Capture = { ...capture, convertTo: target };
    setCaptures(captures.map(c => (c.id === capture.id ? updated : c)));
    setSelectedCapture(updated);
    setConvertMsg(`Added to ${target}s`);
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
        <button type="button" 
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
          <button type="button" 
            onClick={() => setShowCaptureModal(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition-colors"
          >
            Capture something
          </button>
        </div>
      )}

      {/* Quick Capture Modal */}
      <Modal
        open={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
        title="Quick Capture"
        description="Save an idea, link or note to your inbox."
        footer={
          <>
            <button
              onClick={() => setShowCaptureModal(false)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors"
            >
              Cancel
            </button>
            <button type="button" 
              onClick={handleAddCapture}
              disabled={!newCaptureContent.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Capture
            </button>
          </>
        }
      >
        {/* Type Selector */}
        <div className="flex items-center gap-2">
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
          />
        </div>
      </Modal>

      {/* Capture Detail Modal */}
      {selectedCapture && (
        <Modal
          open
          onClose={closeDetail}
          title={selectedCapture.title || 'Capture'}
          description={`${typeConfig[selectedCapture.type].label} capture · ${selectedCapture.timestamp}`}
          footer={
            <>
              {selectedCapture.status === 'new' && (
                <button type="button" onClick={() => handleStatusChange(selectedCapture.id, 'reviewing')} className="flex-1 px-3 py-2 rounded-lg bg-warning/15 text-warning text-xs font-medium hover:bg-warning/25 transition-colors">
                  Start Review
                </button>
              )}
              {selectedCapture.status === 'reviewing' && (
                <button type="button" onClick={() => handleStatusChange(selectedCapture.id, 'organized')} className="flex-1 px-3 py-2 rounded-lg bg-success/15 text-success text-xs font-medium hover:bg-success/25 transition-colors">
                  <CheckCircle2 className="w-3 h-3 inline mr-1" /> Mark Organized
                </button>
              )}
              <button type="button" onClick={() => handleStatusChange(selectedCapture.id, 'archived')} className="flex-1 px-3 py-2 rounded-lg bg-elevated text-muted text-xs font-medium hover:bg-elevated/80 transition-colors">
                <Archive className="w-3 h-3 inline mr-1" /> Archive
              </button>
            </>
          }
        >
          <div className="p-3 rounded-lg bg-elevated/50">
            <p className="text-sm text-text break-words">{selectedCapture.content}</p>
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

          {/* Conversion confirmation */}
          {convertMsg && (
            <div role="status" className="flex items-center gap-2 p-2.5 rounded-lg bg-success/15 text-success text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              {convertMsg} — open that page to see it.
            </div>
          )}

          {selectedCapture.convertTo && !convertMsg && (
            <p className="flex items-center gap-1.5 text-xs text-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Converted to {selectedCapture.convertTo}
            </p>
          )}

          {/* Convert To */}
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-2">Convert to</p>
            <div className="grid grid-cols-3 gap-2">
              {conversionTargets.map(target => (
                <button
                  key={target}
                  onClick={() => handleConvert(target)}
                  disabled={!!selectedCapture.convertTo || !!convertMsg}
                  className="px-3 py-2 rounded-lg bg-elevated/50 text-xs text-text hover:bg-primary/15 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {target}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
