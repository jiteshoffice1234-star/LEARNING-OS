import { useState } from 'react';
import { 
  RotateCcw, Calendar, CheckCircle2, Clock, AlertTriangle, 
  Plus, ChevronRight, BookOpen, Filter, MoreHorizontal
} from 'lucide-react';

interface Revision {
  id: string;
  subject: string;
  chapter: string;
  cycle: number;
  dueDate: string;
  completedDate?: string;
  status: 'upcoming' | 'overdue' | 'completed' | 'postponed';
  notes?: string;
  interval: number;
}

const initialRevisions: Revision[] = [
  { id: '1', subject: 'Algorithms', chapter: 'Dynamic Programming', cycle: 2, dueDate: '2026-11-02', status: 'upcoming', interval: 7 },
  { id: '2', subject: 'Machine Learning', chapter: 'Neural Networks', cycle: 1, dueDate: '2026-11-03', status: 'upcoming', interval: 3 },
  { id: '3', subject: 'Database Systems', chapter: 'Normalization', cycle: 3, dueDate: '2026-10-30', status: 'overdue', interval: 14 },
  { id: '4', subject: 'Operating Systems', chapter: 'Process Scheduling', cycle: 1, dueDate: '2026-11-05', status: 'upcoming', interval: 3 },
  { id: '5', subject: 'Python', chapter: 'Decorators', cycle: 4, dueDate: '2026-10-28', completedDate: '2026-10-27', status: 'completed', interval: 30 },
  { id: '6', subject: 'Computer Networks', chapter: 'TCP/IP', cycle: 2, dueDate: '2026-11-08', status: 'upcoming', interval: 7 },
  { id: '7', subject: 'Algorithms', chapter: 'Graph Theory', cycle: 1, dueDate: '2026-11-01', status: 'overdue', interval: 3 },
  { id: '8', subject: 'System Design', chapter: 'Load Balancing', cycle: 2, dueDate: '2026-11-10', status: 'postponed', interval: 7 },
];

export default function RevisionManager() {
  const [revisions, setRevisions] = useState(initialRevisions);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);

  const filtered = revisions.filter(r => filter === 'all' || r.status === filter);
  
  const stats = {
    upcoming: revisions.filter(r => r.status === 'upcoming').length,
    overdue: revisions.filter(r => r.status === 'overdue').length,
    completed: revisions.filter(r => r.status === 'completed').length,
    total: revisions.length,
  };

  const handleComplete = (id: string) => {
    setRevisions(revisions.map(r => 
      r.id === id ? { ...r, status: 'completed' as const, completedDate: new Date().toISOString().split('T')[0] } : r
    ));
    setSelectedRevision(null);
  };

  const handlePostpone = (id: string) => {
    setRevisions(revisions.map(r => 
      r.id === id ? { ...r, status: 'postponed' as const, dueDate: '2026-11-15' } : r
    ));
  };

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-text">Revision Manager</h1>
          <p className="text-xs text-muted">Spaced repetition for retention</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <Clock className="w-3 h-3 text-primary" />
          <span className="text-[11px] text-text font-medium">{stats.upcoming}</span>
          <span className="text-[10px] text-muted">Upcoming</span>
        </div>
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <AlertTriangle className="w-3 h-3 text-danger" />
          <span className="text-[11px] text-danger font-medium">{stats.overdue}</span>
          <span className="text-[10px] text-muted">Overdue</span>
        </div>
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <CheckCircle2 className="w-3 h-3 text-success" />
          <span className="text-[11px] text-success font-medium">{stats.completed}</span>
          <span className="text-[10px] text-muted">Done</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
        {(['all', 'upcoming', 'overdue', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
            }`}
          >
            {f} {f !== 'all' && `(${stats[f]})`}
          </button>
        ))}
      </div>

      {/* Revision List */}
      <div className="space-y-1">
        {filtered.map((revision) => (
          <div
            key={revision.id}
            onClick={() => setSelectedRevision(revision)}
            className="glass-card rounded-lg p-2 cursor-pointer hover:border-primary/30 transition-all group flex items-center gap-2"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Cycle Badge */}
              <div className={`w-8 h-8 rounded flex flex-col items-center justify-center flex-shrink-0 ${
                revision.status === 'completed' ? 'bg-success/15' :
                revision.status === 'overdue' ? 'bg-danger/15' :
                revision.status === 'postponed' ? 'bg-warning/15' : 'bg-primary/15'
              }`}>
                <span className={`text-[10px] font-bold ${
                  revision.status === 'completed' ? 'text-success' :
                  revision.status === 'overdue' ? 'text-danger' :
                  revision.status === 'postponed' ? 'text-warning' : 'text-primary'
                }`}>R{revision.cycle}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-medium text-text truncate">{revision.chapter}</h3>
                  <span className={`text-[9px] px-1 py-0.5 rounded flex-shrink-0 ${
                    revision.status === 'completed' ? 'bg-success/15 text-success' :
                    revision.status === 'overdue' ? 'bg-danger/15 text-danger' :
                    revision.status === 'postponed' ? 'bg-warning/15 text-warning' : 'bg-primary/15 text-primary'
                  }`}>
                    {revision.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
                  <span>{revision.subject}</span>
                  <span>•</span>
                  <span>{revision.dueDate}</span>
                </div>
              </div>

              {/* Actions */}
              {revision.status !== 'completed' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleComplete(revision.id); }}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-success/15 text-success text-[10px] font-medium hover:bg-success/25 transition-colors flex-shrink-0"
                >
                  <CheckCircle2 className="w-3 h-3" /> Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Revision Detail Modal */}
      {selectedRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedRevision(null)} />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">Revision Details</h2>
              <button onClick={() => setSelectedRevision(null)} className="p-1.5 rounded-lg hover:bg-elevated text-muted">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Chapter</p>
                <p className="text-sm text-text font-medium">{selectedRevision.chapter}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-sm text-text">{selectedRevision.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Cycle</p>
                  <p className="text-sm text-text">Revision {selectedRevision.cycle}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Due Date</p>
                  <p className="text-sm text-text">{selectedRevision.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Interval</p>
                  <p className="text-sm text-text">{selectedRevision.interval} days</p>
                </div>
              </div>
              {selectedRevision.completedDate && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Completed</p>
                  <p className="text-sm text-success">{selectedRevision.completedDate}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              {selectedRevision.status !== 'completed' && (
                <>
                  <button 
                    onClick={() => handleComplete(selectedRevision.id)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors"
                  >
                    Mark Complete
                  </button>
                  <button 
                    onClick={() => handlePostpone(selectedRevision.id)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors"
                  >
                    Postpone
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Revision Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddModal(false)} />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">New Revision</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-elevated text-muted">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Subject</label>
                <select className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary">
                  <option>Algorithms</option>
                  <option>Machine Learning</option>
                  <option>Database Systems</option>
                  <option>Operating Systems</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Chapter</label>
                <input type="text" placeholder="Enter chapter name" className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Cycle</label>
                  <input type="number" defaultValue={1} min={1} className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Interval (days)</label>
                  <input type="number" defaultValue={7} min={1} className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Due Date</label>
                <input type="date" className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
