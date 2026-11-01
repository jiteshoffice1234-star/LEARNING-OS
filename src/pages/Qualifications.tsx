import { useState } from 'react';
import { usePersistentState, isDataWiped } from '../lib/storage';
import Modal, { ModalActions } from '../components/Modal';
import { 
  GraduationCap, Plus, Award, BookOpen, Clock, CheckCircle2,
  Pause, XCircle, ChevronRight, Calendar, Building2, Trash2
} from 'lucide-react';
import { qualifications } from '../data/mockData';

interface Qualification {
  id: string;
  name: string;
  institution: string;
  status: 'planned' | 'pursuing' | 'completed' | 'paused' | 'discontinued';
  year: string;
  grade: string;
  type: 'academic' | 'professional';
  papers?: { name: string; marks?: string; grade?: string }[];
}

const initialQualifications: Qualification[] = [
  ...qualifications.map(q => ({ 
    ...q, 
    status: q.status as Qualification['status'],
    type: (q.name.includes('B.Tech') ? 'academic' : 'professional') as Qualification['type']
  })),
  { id: '5', name: 'Higher Secondary (XII)', institution: 'Delhi Public School', status: 'completed', year: '2020-2022', grade: '95.2%', type: 'academic' },
  { id: '6', name: 'Secondary (X)', institution: 'Delhi Public School', status: 'completed', year: '2020', grade: '93.6%', type: 'academic' },
  { id: '7', name: 'Kubernetes Administrator', institution: 'CNCF', status: 'pursuing', year: '2026', grade: '-', type: 'professional' },
  { id: '8', name: 'CFA Level 2', institution: 'CFA Institute', status: 'planned', year: '2027', grade: '-', type: 'professional' },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  planned: { icon: Clock, color: 'text-muted', bg: 'bg-muted/15' },
  pursuing: { icon: BookOpen, color: 'text-primary', bg: 'bg-primary/15' },
  completed: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/15' },
  paused: { icon: Pause, color: 'text-warning', bg: 'bg-warning/15' },
  discontinued: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/15' },
};

const statusLabels: Qualification['status'][] = ['planned', 'pursuing', 'completed', 'paused', 'discontinued'];

export default function Qualifications() {
  const wiped = isDataWiped();
  const [quals, setQuals] = usePersistentState<Qualification[]>('qualifications', wiped ? [] : initialQualifications);
  const [filter, setFilter] = useState<'all' | 'academic' | 'professional'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQual, setSelectedQual] = useState<Qualification | null>(null);

  // --- Add Qualification form state ---
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [status, setStatus] = useState<Qualification['status']>('planned');
  const [year, setYear] = useState('');
  const [grade, setGrade] = useState('');
  const [type, setType] = useState<Qualification['type']>('academic');

  const filtered = quals.filter(q => {
    const matchType = filter === 'all' || q.type === filter;
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchType && matchStatus;
  });

  const resetForm = () => {
    setName('');
    setInstitution('');
    setStatus('planned');
    setYear('');
    setGrade('');
    setType('academic');
  };

  const handleAddQualification = () => {
    if (!name.trim() || !institution.trim()) return;
    const qual: Qualification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      institution: institution.trim(),
      status,
      year: year.trim() || new Date().getFullYear().toString(),
      grade: grade.trim() || '-',
      type,
    };
    setQuals([...quals, qual]);
    resetForm();
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setQuals(quals.filter((q) => q.id !== id));
    setSelectedQual((prev) => (prev?.id === id ? null : prev));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Qualifications</h1>
          <p className="text-sm text-muted mt-1">Your academic and professional credentials</p>
        </div>
        <button type="button" 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-text">{quals.length}</p>
          <p className="text-xs text-muted">Total</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-success">{quals.filter(q => q.status === 'completed').length}</p>
          <p className="text-xs text-muted">Completed</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-primary">{quals.filter(q => q.status === 'pursuing').length}</p>
          <p className="text-xs text-muted">Pursuing</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-warning">{quals.filter(q => q.status === 'planned').length}</p>
          <p className="text-xs text-muted">Planned</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex items-center gap-1 bg-elevated/50 rounded-lg p-1">
          {(['all', 'academic', 'professional'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-elevated/50 rounded-lg p-1">
          {['all', 'completed', 'pursuing', 'planned', 'paused'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Qualifications List */}
      <div className="space-y-3">
        {filtered.map((qual) => {
          const config = statusConfig[qual.status];
          const Icon = config.icon;
          return (
            <div
              key={qual.id}
              onClick={() => setSelectedQual(qual)}
              className="glass-card rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  {qual.type === 'academic' ? (
                    <GraduationCap className={`w-5 h-5 ${config.color}`} />
                  ) : (
                    <Award className={`w-5 h-5 ${config.color}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text truncate">{qual.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${config.bg} ${config.color}`}>
                      {qual.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {qual.institution}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {qual.year}
                    </span>
                    {qual.grade !== '-' && (
                      <span className="font-medium text-text">{qual.grade}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(qual.id); }}
                  aria-label={`Delete qualification: ${qual.name}`}
                  className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <GraduationCap className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-muted">No qualifications match these filters</p>
        </div>
      )}

      {/* New Qualification dialog */}
      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); resetForm(); }}
        title="Add Qualification"
        description="Add an academic or professional credential to your record."
        footer={
          <ModalActions
            onCancel={() => { setShowAdd(false); resetForm(); }}
            onSubmit={handleAddQualification}
            submitLabel="Add Qualification"
            submitDisabled={!name.trim() || !institution.trim()}
          />
        }
      >
        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Name *</label>
          <input
            type="text"
            placeholder="e.g. AWS Solutions Architect"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddQualification()}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Institution *</label>
          <input
            type="text"
            placeholder="e.g. IIT Delhi"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Year</label>
            <input
              type="text"
              placeholder="e.g. 2026 or 2022-2026"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Grade</label>
            <input
              type="text"
              placeholder="e.g. 8.5 CGPA"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Qualification['status'])}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text capitalize focus:outline-none focus:border-primary"
          >
            {statusLabels.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-2 block">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['academic', 'professional'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  type === t ? 'bg-primary text-white' : 'bg-elevated text-text hover:bg-elevated/80 border border-border/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      {selectedQual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedQual(null)} />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">{selectedQual.name}</h2>
              <button type="button" onClick={() => setSelectedQual(null)} className="p-1.5 rounded-lg hover:bg-elevated text-muted">✕</button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig[selectedQual.status].bg}`}>
                  {(() => { const Icon = statusConfig[selectedQual.status].icon; return <Icon className={`w-5 h-5 ${statusConfig[selectedQual.status].color}`} />; })()}
                </div>
                <div>
                  <p className="text-sm font-medium text-text capitalize">{selectedQual.status}</p>
                  <p className="text-xs text-muted">{selectedQual.type === 'academic' ? 'Academic' : 'Professional'} Qualification</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Institution</p>
                  <p className="text-sm text-text">{selectedQual.institution}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Year</p>
                  <p className="text-sm text-text">{selectedQual.year}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Grade</p>
                  <p className="text-sm text-text">{selectedQual.grade}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Type</p>
                  <p className="text-sm text-text capitalize">{selectedQual.type}</p>
                </div>
              </div>

              {selectedQual.status === 'pursuing' && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary">Currently pursuing • Next exam scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
