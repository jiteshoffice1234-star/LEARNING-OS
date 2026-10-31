import { useState } from 'react';
import { 
  Zap, Plus, Clock, CheckCircle2, Calendar, Users, 
  ChevronRight, Target, Code
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  progress: number;
  startDate: string;
  targetDate?: string;
  skills: string[];
  tasks: { total: number; completed: number };
}

const initialProjects: Project[] = [
  { id: '1', name: 'REST API Backend', description: 'Build a scalable REST API with authentication and database integration', status: 'active', progress: 45, startDate: '2026-10-15', targetDate: '2026-12-01', skills: ['Backend', 'Node.js', 'PostgreSQL'], tasks: { total: 12, completed: 5 } },
  { id: '2', name: 'ML Sentiment Analyzer', description: 'Train a model to analyze sentiment in text data using transformers', status: 'active', progress: 30, startDate: '2026-10-20', targetDate: '2027-01-15', skills: ['Python', 'ML', 'NLP'], tasks: { total: 8, completed: 2 } },
  { id: '3', name: 'Portfolio Website', description: 'Personal portfolio showcasing projects and skills', status: 'completed', progress: 100, startDate: '2026-09-01', targetDate: '2026-09-30', skills: ['React', 'TypeScript', 'Design'], tasks: { total: 10, completed: 10 } },
  { id: '4', name: 'Study Tracker App', description: 'Mobile app to track study sessions and progress', status: 'planning', progress: 10, startDate: '2026-11-01', targetDate: '2027-02-01', skills: ['Flutter', 'Dart', 'SQLite'], tasks: { total: 15, completed: 1 } },
  { id: '5', name: 'Algorithm Visualizer', description: 'Interactive web app to visualize sorting and graph algorithms', status: 'paused', progress: 60, startDate: '2026-08-15', skills: ['JavaScript', 'Canvas', 'Algorithms'], tasks: { total: 8, completed: 5 } },
];

const statusConfig = {
  planning: { color: 'text-muted', bg: 'bg-muted/15', label: 'Planning' },
  active: { color: 'text-success', bg: 'bg-success/15', label: 'Active' },
  completed: { color: 'text-primary', bg: 'bg-primary/15', label: 'Completed' },
  paused: { color: 'text-warning', bg: 'bg-warning/15', label: 'Paused' },
};

export default function Projects() {
  const [projects] = useState(initialProjects);
  const [filter, setFilter] = useState<'all' | 'active' | 'planning' | 'completed'>('all');

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Projects
          </h1>
          <p className="text-sm text-muted mt-1">Build real things to solidify your learning</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Project</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-text">{projects.length}</p>
          <p className="text-xs text-muted">Total Projects</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-success">{projects.filter(p => p.status === 'active').length}</p>
          <p className="text-xs text-muted">Active</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-primary">{projects.filter(p => p.status === 'completed').length}</p>
          <p className="text-xs text-muted">Completed</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-warning">{projects.reduce((acc, p) => acc + p.skills.length, 0)}</p>
          <p className="text-xs text-muted">Skills Used</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'active', 'planning', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((project) => {
          const status = statusConfig[project.status];
          return (
            <div key={project.id} className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.bg}`}>
                    <Code className={`w-5 h-5 ${status.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text">{project.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <p className="text-xs text-muted mb-4 line-clamp-2">{project.description}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted">Progress</span>
                  <span className="text-xs font-medium text-text">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              {/* Tasks */}
              <div className="flex items-center gap-4 mb-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {project.tasks.completed}/{project.tasks.total} tasks
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {project.startDate}
                </span>
              </div>

              {/* Skills */}
              <div className="flex items-center gap-1 flex-wrap">
                {project.skills.map(skill => (
                  <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-elevated/50 text-muted">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Zap className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-muted">No projects in this category</p>
        </div>
      )}
    </div>
  );
}
