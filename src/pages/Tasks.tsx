import { useState } from 'react';
import { 
  CheckSquare, Plus, CheckCircle2, Circle, Clock, AlertTriangle, 
  Calendar, Flag, X, Tag, Filter
} from 'lucide-react';

interface Task {
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

const initialTasks: Task[] = [
  { id: '1', title: 'Complete Dynamic Programming chapter', status: 'in-progress', priority: 'high', dueDate: '2026-11-02', tags: ['algorithms', 'study'], linkedTo: 'Study Center', createdAt: '2026-10-30' },
  { id: '2', title: 'Review ML lecture notes', status: 'todo', priority: 'medium', dueDate: '2026-11-03', tags: ['ml', 'revision'], linkedTo: 'Revisions', createdAt: '2026-10-30' },
  { id: '3', title: 'Submit AWS certification application', status: 'todo', priority: 'high', dueDate: '2026-11-05', tags: ['certification', 'career'], createdAt: '2026-10-29' },
  { id: '4', title: 'Build REST API project', status: 'in-progress', priority: 'medium', tags: ['project', 'backend'], linkedTo: 'Projects', createdAt: '2026-10-28' },
  { id: '5', title: 'Read DDIA Chapter 5', status: 'done', priority: 'medium', tags: ['reading', 'system-design'], createdAt: '2026-10-27' },
  { id: '6', title: 'Practice 10 SQL problems', status: 'todo', priority: 'low', dueDate: '2026-11-07', tags: ['sql', 'practice'], createdAt: '2026-10-26' },
  { id: '7', title: 'Update learning roadmap', status: 'done', priority: 'low', tags: ['planning'], linkedTo: 'Roadmap', createdAt: '2026-10-25' },
  { id: '8', title: 'Prepare for mock test', status: 'todo', priority: 'high', dueDate: '2026-11-01', tags: ['test', 'algorithms'], linkedTo: 'Tests', createdAt: '2026-10-31' },
];

const priorityConfig = {
  low: { color: 'text-muted', bg: 'bg-muted/15', icon: Flag },
  medium: { color: 'text-warning', bg: 'bg-warning/15', icon: Flag },
  high: { color: 'text-danger', bg: 'bg-danger/15', icon: Flag },
};

export default function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  
  const stats = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: 'todo',
      priority: newTaskPriority,
      tags: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  const toggleStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id !== id) return t;
      const nextStatus = t.status === 'todo' ? 'in-progress' : t.status === 'in-progress' ? 'done' : 'todo';
      return { ...t, status: nextStatus };
    }));
  };

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            Tasks
          </h1>
          <p className="text-xs text-muted">To-dos and action items</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="glass-card rounded-lg p-2.5 flex items-center gap-2">
          <Circle className="w-3 h-3 text-muted" />
          <div>
            <p className="text-sm font-bold text-text">{stats.todo}</p>
            <p className="text-[10px] text-muted">To Do</p>
          </div>
        </div>
        <div className="glass-card rounded-lg p-2.5 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-primary" />
          <div>
            <p className="text-sm font-bold text-primary">{stats.inProgress}</p>
            <p className="text-[10px] text-muted">Active</p>
          </div>
        </div>
        <div className="glass-card rounded-lg p-2.5 flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-success" />
          <div>
            <p className="text-sm font-bold text-success">{stats.done}</p>
            <p className="text-[10px] text-muted">Done</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
        {(['all', 'todo', 'in-progress', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
            }`}
          >
            {f === 'in-progress' ? 'In Progress' : f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-1">
        {filtered.map((task) => {
          const priority = priorityConfig[task.priority];
          const isDone = task.status === 'done';
          return (
            <div
              key={task.id}
              className="glass-card rounded-lg p-2 hover:border-primary/20 transition-all group flex items-center gap-2"
            >
              {/* Checkbox */}
              <button 
                onClick={() => toggleStatus(task.id)}
                className="flex-shrink-0"
              >
                {task.status === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : task.status === 'in-progress' ? (
                  <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-muted hover:text-primary transition-colors" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <h3 className={`text-xs font-medium truncate ${isDone ? 'text-muted line-through' : 'text-text'}`}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {task.dueDate && (
                    <span className="text-[10px] text-muted">{task.dueDate.slice(5)}</span>
                  )}
                  {task.linkedTo && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-primary/10 text-primary">
                      {task.linkedTo}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <CheckSquare className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-muted">No tasks here</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition-colors"
          >
            Add a task
          </button>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddModal(false)} />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">New Task</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-elevated text-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                autoFocus
              />
              
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-2 block">Priority</label>
                <div className="flex items-center gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTaskPriority(p)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                        newTaskPriority === p 
                          ? p === 'high' ? 'bg-danger/15 text-danger' : p === 'medium' ? 'bg-warning/15 text-warning' : 'bg-elevated text-text'
                          : 'bg-elevated/50 text-muted hover:text-text'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-2 block">Due Date</label>
                <input type="date" className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
