import { useState } from 'react';
import { 
  Target, Plus, TrendingUp, Calendar, CheckCircle2, 
  Clock, AlertTriangle, ChevronRight, Flame
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
  const [goals] = useState(initialGoals);
  const [filter, setFilter] = useState<'all' | 'learning' | 'skill' | 'career' | 'personal'>('all');

  const filtered = filter === 'all' ? goals : goals.filter(g => g.type === filter);

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
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
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
                <div className="text-right">
                  <p className="text-lg font-bold text-text">{goal.progress}%</p>
                  <p className="text-[10px] text-muted flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" /> {goal.targetDate}
                  </p>
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
                <p className="text-xs text-muted font-medium">Milestones ({completedMilestones}/{goal.milestones.length})</p>
                {goal.milestones.map((milestone, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {milestone.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
                    )}
                    <span className={`text-xs ${milestone.completed ? 'text-muted line-through' : 'text-text'}`}>
                      {milestone.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Target className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-muted">No goals in this category</p>
        </div>
      )}
    </div>
  );
}
