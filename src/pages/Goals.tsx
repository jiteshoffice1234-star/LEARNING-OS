import { useState } from 'react';
import { usePersistentState, isDataWiped } from '../lib/storage';
import Modal, { ModalActions } from '../components/Modal';
import { 
  Target, Plus, TrendingUp, Calendar, CheckCircle2, 
  Clock, AlertTriangle, ChevronRight, Flame, Trash2
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'learning' | 'skill' | 'career' | 'personal';
  targetDate: string;
  progress: number;
  milestones: { title: string; completed: boolean }[];
  status: 'on-track' | 'at-risk' | 'completed';
}

const initialGoals: Goal[] = [
  { id: '1', title: 'Master Machine Learning', description: 'Reach advanced proficiency in ML by completing courses and building projects', type: 'skill', targetDate: '2027-03-01', progress: 35, milestones: [{ title: 'Complete Andrew Ng Course', completed: true }, { title: 'Build 3 ML Projects', completed: false }, { title: 'Get TensorFlow Certificate', completed: false }], status: 'on-track' },
  { id: '2', title: 'AWS Solutions Architect Pro', description: 'Pass the AWS SAP certification exam', type: 'career', targetDate: '2026-12-31', progress: 60, milestones: [{ title: 'Complete study guide', completed: true }, { title: 'Take 5 practice exams', completed: true }, { title: 'Pass certification exam', completed: false }], status: 'on-track' },
  { id: '3', title: 'Read 20 Technical Books', description: 'Read and summarize 20 books on CS and software engineering', type: 'learning', targetDate: '2026-12-31', progress: 45, milestones: [{ title: 'Read DDIA', completed: true }, { title: 'Read Clean Code', completed: true }, { title: 'Read 10 more books', completed: false }], status: 'on-track' },
  { id: '4', title: 'Build Public Portfolio', description: 'Create a portfolio website with 5+ projects', type: 'personal', targetDate: '2026-11-30', progress: 80, milestones: [{ title: 'Design layout', completed: true }, { title: 'Build 3 projects', completed: true }, { title: 'Deploy website', completed: false }], status: 'on-track' },
  { id: '5', title: 'Contribute to Open Source', description: 'Make meaningful contributions to 3 open source projects', type: 'career', targetDate: '2027-01-31', progress: 20, milestones: [{ title: 'Find projects', completed: true }, { title: 'Submit first PR', completed: false }, { title: 'Get 3 PRs merged', completed: false }], status: 'at-risk' },
];

const typeConfig = {
  learning: { color: 'text-primary', bg: 'bg-primary/15', label: 'Learning' },
  skill: { color: 'text-success', bg: 'bg-success/15', label: 'Skill' },
  career: { color: 'text-warning', bg: 'bg-warning/15', label: 'Career' },
  personal: { color: 'text-accent', bg: 'bg-accent/15', label: 'Personal' },
};

export default function Goals() {
  const wiped = isDataWiped();
  const [goals, setGoals] = usePersistentState<Goal[]>('goals', wiped ? [] : initialGoals);
  const [filter, setFilter] = useState<'all' | 'learning' | 'skill' | 'career' | 'personal'>('all');

  // --- New Goal form state ---
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Goal['type']>('learning');
  const [targetDate, setTargetDate] = useState('');
  const [milestoneInput, setMilestoneInput] = useState('');

  const filtered = filter === 'all' ? goals : goals.filter(g => g.type === filter);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('learning');
    setTargetDate('');
    setMilestoneInput('');
  };

  const handleAddGoal = () => {
    if (!title.trim()) return;
    const milestones = milestoneInput
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m) => ({ title: m, completed: false }));

    const goal: Goal = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      description: description.trim() || 'No description yet.',
      type,
      // Default to 90 days out when no date is picked so the card is never blank.
      targetDate: targetDate || new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10),
      progress: 0,
      milestones,
      status: 'on-track',
    };
    setGoals([...goals, goal]);
    resetForm();
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  /** Toggle a milestone and recompute the goal's progress from completion. */
  const toggleMilestone = (goalId: string, index: number) => {
    setGoals(
      goals.map((g) => {
        if (g.id !== goalId) return g;
        const milestones = g.milestones.map((m, i) =>
          i === index ? { ...m, completed: !m.completed } : m
        );
        const done = milestones.filter((m) => m.completed).length;
        const progress = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
        return {
          ...g,
          milestones,
          progress,
          status: progress === 100 ? 'completed' : g.status === 'completed' ? 'on-track' : g.status,
        };
      })
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Goals
          </h1>
          <p className="text-sm text-muted mt-1">Set intentions and track your progress</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Goal</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-text">{goals.length}</p>
          <p className="text-xs text-muted">Active Goals</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-success">{goals.filter(g => g.status === 'on-track').length}</p>
          <p className="text-xs text-muted">On Track</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-warning">{goals.filter(g => g.status === 'at-risk').length}</p>
          <p className="text-xs text-muted">At Risk</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-primary">{Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)}%</p>
          <p className="text-xs text-muted">Avg Progress</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'learning', 'skill', 'career', 'personal'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
            }`}
          >
            {f === 'all' ? 'All Goals' : f}
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filtered.map((goal) => {
          const type = typeConfig[goal.type];
          const completedMilestones = goal.milestones.filter(m => m.completed).length;
          return (
            <div key={goal.id} className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type.bg}`}>
                    <Target className={`w-5 h-5 ${type.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text">{goal.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${type.bg} ${type.color}`}>
                        {type.label}
                      </span>
                      <span className={`text-[10px] flex items-center gap-0.5 ${
                        goal.status === 'on-track' ? 'text-success' : 'text-warning'
                      }`}>
                        {goal.status === 'on-track' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {goal.status === 'on-track' ? 'On Track' : 'At Risk'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-lg font-bold text-text">{goal.progress}%</p>
                    <p className="text-[10px] text-muted flex items-center gap-0.5 justify-end">
                      <Calendar className="w-3 h-3" /> {goal.targetDate}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    aria-label={`Delete goal: ${goal.title}`}
                    className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted mb-4">{goal.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-2">
                <p className="text-xs text-muted font-medium">Milestones ({completedMilestones}/{goal.milestones.length}) — tap to toggle</p>
                {goal.milestones.map((milestone, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleMilestone(goal.id, i)}
                    aria-pressed={milestone.completed}
                    className="w-full flex items-center gap-2 text-left rounded-md px-1 py-0.5 hover:bg-elevated/50 transition-colors"
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
                    )}
                    <span className={`text-xs ${milestone.completed ? 'text-muted line-through' : 'text-text'}`}>
                      {milestone.title}
                    </span>
                  </button>
                ))}
                {goal.milestones.length === 0 && (
                  <p className="text-[11px] text-muted italic">No milestones yet.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Target className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-muted">No goals in this category</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Create your first goal
          </button>
        </div>
      )}

      {/* New Goal dialog */}
      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); resetForm(); }}
        title="New Goal"
        description="Define what you want to achieve and how you'll get there."
        footer={
          <ModalActions
            onCancel={() => { setShowAdd(false); resetForm(); }}
            onSubmit={handleAddGoal}
            submitLabel="Create Goal"
            submitDisabled={!title.trim()}
          />
        }
      >
        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Title *</label>
          <input
            type="text"
            placeholder="e.g. Master Machine Learning"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Description</label>
          <textarea
            placeholder="Why does this matter?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-2 block">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['learning', 'skill', 'career', 'personal'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  type === t ? 'bg-primary text-white' : 'bg-elevated text-text hover:bg-elevated/80 border border-border/50'
                }`}
              >
                {typeConfig[t].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Target Date</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Milestones</label>
          <textarea
            placeholder={'One per line, e.g.\nComplete course\nBuild 3 projects\nPass exam'}
            value={milestoneInput}
            onChange={(e) => setMilestoneInput(e.target.value)}
            rows={4}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary resize-none"
          />
          <p className="text-[11px] text-muted mt-1">One milestone per line. Progress is calculated from these.</p>
        </div>
      </Modal>
    </div>
  );
}
