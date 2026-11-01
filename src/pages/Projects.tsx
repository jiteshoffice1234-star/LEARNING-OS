import { useState } from 'react';
import { usePersistentState, isDataWiped } from '../lib/storage';
import Modal, { ModalActions } from '../components/Modal';
import { 
  Zap, Plus, Clock, CheckCircle2, Calendar, Users, 
  ChevronRight, Target, Code, Trash2
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
  const wiped = isDataWiped();
  const [projects, setProjects] = usePersistentState<Project[]>('projects', wiped ? [] : initialProjects);
  const [filter, setFilter] = useState<'all' | 'active' | 'planning' | 'completed'>('all');

  // --- New Project form state ---
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('planning');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  // --- Detail view state ---
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus('planning');
    setStartDate('');
    setTargetDate('');
    setSkillsInput('');
  };

  const handleAddProject = () => {
    if (!name.trim()) return;
    const project: Project = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      description: description.trim() || 'No description yet.',
      status,
      progress: 0,
      startDate: startDate || new Date().toISOString().slice(0, 10),
      targetDate: targetDate || undefined,
      skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      tasks: { total: 0, completed: 0 },
    };
    setProjects([...projects, project]);
    resetForm();
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    setSelectedProject((prev) => (prev?.id === id ? null : prev));
  };

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
        <button type="button" 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
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
            <div 
              key={project.id} 
              onClick={() => setSelectedProject(project)}
              className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all cursor-pointer group"
            >
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
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                    aria-label={`Delete project: ${project.name}`}
                    className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
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
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Create your first project
          </button>
        </div>
      )}

      {/* New Project dialog */}
      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); resetForm(); }}
        title="New Project"
        description="Track something you're building to practice your skills."
        footer={
          <ModalActions
            onCancel={() => { setShowAdd(false); resetForm(); }}
            onSubmit={handleAddProject}
            submitLabel="Create Project"
            submitDisabled={!name.trim()}
          />
        }
      >
        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Name *</label>
          <input
            type="text"
            placeholder="e.g. REST API Backend"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Description</label>
          <textarea
            placeholder="What will you build and why?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-2 block">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {(['planning', 'active', 'completed', 'paused'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  status === s ? 'bg-primary text-white' : 'bg-elevated text-text hover:bg-elevated/80 border border-border/50'
                }`}
              >
                {statusConfig[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
            />
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
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Skills</label>
          <input
            type="text"
            placeholder="e.g. React, TypeScript, Design"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
          />
          <p className="text-[11px] text-muted mt-1">Comma-separated list of skills this project uses.</p>
        </div>
      </Modal>

      {/* Project detail dialog */}
      <Modal
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.name ?? 'Project'}
        description="Project details"
        footer={
          <button
            type="button"
            onClick={() => setSelectedProject(null)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors"
          >
            Close
          </button>
        }
      >
        {selectedProject && (
          <>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig[selectedProject.status].bg}`}>
                <Code className={`w-5 h-5 ${statusConfig[selectedProject.status].color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-text capitalize">{statusConfig[selectedProject.status].label}</p>
                <p className="text-xs text-muted">Started {selectedProject.startDate}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-text">{selectedProject.description}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted uppercase tracking-wider">Progress</span>
                <span className="text-sm font-medium text-text">{selectedProject.progress}%</span>
              </div>
              <div className="h-2 bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${selectedProject.progress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Tasks</p>
                <p className="text-sm text-text flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  {selectedProject.tasks.completed}/{selectedProject.tasks.total} completed
                </p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Target Date</p>
                <p className="text-sm text-text">{selectedProject.targetDate || 'Not set'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-2">Skills</p>
              {selectedProject.skills.length > 0 ? (
                <div className="flex items-center gap-1 flex-wrap">
                  {selectedProject.skills.map((skill) => (
                    <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-elevated/50 text-muted">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted italic">No skills tagged yet.</p>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
