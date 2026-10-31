import { useState } from 'react';
import { 
  Target, Calendar, TrendingUp, AlertTriangle, CheckCircle2, 
  Clock, Plus, ChevronRight, ArrowRight, GitBranch
} from 'lucide-react';
import { roadmaps, roadmapItems } from '../data/mockData';

const statusColors: Record<string, string> = {
  'on-track': '#43B889',
  'delayed': '#E5AA55',
  'completed': '#8170ED',
  'upcoming': '#9295A3',
};

export default function Roadmap() {
  const [selectedRoadmap, setSelectedRoadmap] = useState(roadmaps[0]);
  const [viewMode, setViewMode] = useState<'gantt' | 'timeline'>('gantt');
  const [duration, setDuration] = useState<'3m' | '6m' | '1y' | '5y'>('6m');

  const items = roadmapItems.filter(item => selectedRoadmap.skills.includes(item.skill));
  
  // Gantt chart calculations
  const startDate = new Date(selectedRoadmap.startDate);
  const endDate = new Date(selectedRoadmap.endDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(100, (days / totalDays) * 100));
  };

  const getWidth = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(5, (days / totalDays) * 100);
  };

  // Generate month markers
  const months = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const pos = getPosition(current.toISOString().split('T')[0]);
    months.push({
      label: current.toLocaleString('default', { month: 'short' }),
      position: pos,
    });
    current.setMonth(current.getMonth() + 1);
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Learning Roadmap</h1>
          <p className="text-sm text-muted mt-1">Plan and track your skill development journey</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Roadmap</span>
        </button>
      </div>

      {/* Roadmap Selector */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {roadmaps.map((rm) => (
          <button
            key={rm.id}
            onClick={() => setSelectedRoadmap(rm)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedRoadmap.id === rm.id ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-elevated/50 text-muted hover:text-text'
            }`}
          >
            {rm.name}
          </button>
        ))}
      </div>

      {/* Duration Selector & View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {(['3m', '6m', '1y', '5y'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                duration === d ? 'bg-elevated text-text' : 'text-muted hover:text-text'
              }`}
            >
              {d === '3m' ? '3 Months' : d === '6m' ? '6 Months' : d === '1y' ? '1 Year' : '5 Years'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-elevated/50 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('gantt')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'gantt' ? 'bg-primary/15 text-primary' : 'text-muted'}`}
          >
            Gantt
          </button>
          <button 
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'timeline' ? 'bg-primary/15 text-primary' : 'text-muted'}`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Roadmap Info */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-semibold text-text">{selectedRoadmap.name}</h3>
            <p className="text-xs text-muted mt-0.5">{selectedRoadmap.startDate} → {selectedRoadmap.endDate} • {selectedRoadmap.skills.join(', ')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-text">{items.length}</p>
              <p className="text-[10px] text-muted">Milestones</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-success">{items.filter(i => i.status === 'on-track').length}</p>
              <p className="text-[10px] text-muted">On Track</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-warning">{items.filter(i => i.status === 'delayed').length}</p>
              <p className="text-[10px] text-muted">Delayed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      {viewMode === 'gantt' ? (
        <div className="glass-card rounded-xl p-5 overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Month Headers */}
            <div className="relative h-8 mb-2 border-b border-border/50">
              {months.map((month, i) => (
                <div 
                  key={i}
                  className="absolute top-0 text-[10px] text-muted font-medium"
                  style={{ left: `${month.position}%` }}
                >
                  {month.label}
                </div>
              ))}
              {/* Today marker */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-primary/50"
                style={{ left: `${getPosition('2026-10-31')}%` }}
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>

            {/* Grid lines */}
            <div className="relative">
              {months.map((month, i) => (
                <div 
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-border/30"
                  style={{ left: `${month.position}%` }}
                />
              ))}
            </div>

            {/* Items */}
            <div className="space-y-3 mt-4">
              {items.map((item) => {
                const left = getPosition(item.startDate);
                const width = getWidth(item.startDate, item.targetDate);
                const color = statusColors[item.status];
                
                return (
                  <div key={item.id} className="relative flex items-center gap-3">
                    <div className="w-32 flex-shrink-0">
                      <p className="text-xs text-text font-medium truncate">{item.milestone}</p>
                      <p className="text-[10px] text-muted">{item.skill}</p>
                    </div>
                    <div className="flex-1 relative h-8">
                      {/* Bar */}
                      <div 
                        className="absolute top-0 h-8 rounded-md flex items-center px-2 transition-all hover:opacity-90 cursor-pointer"
                        style={{ 
                          left: `${left}%`, 
                          width: `${width}%`,
                          backgroundColor: `${color}30`,
                          border: `1px solid ${color}50`,
                        }}
                      >
                        <div 
                          className="h-full rounded-l-md absolute left-0 top-0"
                          style={{ width: `${item.progress}%`, backgroundColor: `${color}60` }}
                        />
                        <span className="relative text-[10px] font-medium" style={{ color }}>
                          {item.progress}%
                        </span>
                      </div>
                      {/* Dependency arrow */}
                      {item.dependsOn && (
                        <div className="absolute -top-3 left-0 text-[10px] text-muted flex items-center gap-0.5">
                          <GitBranch className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="w-16 flex-shrink-0 text-right">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full`} style={{ backgroundColor: `${color}20`, color }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Today line label */}
            <div className="relative mt-4 h-4">
              <div 
                className="absolute text-[10px] text-primary font-medium"
                style={{ left: `${getPosition('2026-10-31')}%` }}
              >
                Today
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Vertical Timeline */
        <div className="glass-card rounded-xl p-5">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border/50" />
            
            <div className="space-y-6">
              {items.map((item, i) => {
                const color = statusColors[item.status];
                const Icon = item.status === 'completed' ? CheckCircle2 : 
                           item.status === 'delayed' ? AlertTriangle : 
                           item.status === 'on-track' ? Target : Clock;
                return (
                  <div key={item.id} className="relative flex gap-4">
                    {/* Node */}
                    <div className="relative z-10 flex-shrink-0">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                        style={{ borderColor: color, backgroundColor: `${color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-text">{item.milestone}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                          {item.progress}%
                        </span>
                      </div>
                      <p className="text-xs text-muted mb-2">{item.skill} • {item.startDate} → {item.targetDate}</p>
                      <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${item.progress}%`, backgroundColor: color }} />
                      </div>
                      {item.dependsOn && (
                        <p className="text-[10px] text-muted mt-1 flex items-center gap-1">
                          <GitBranch className="w-3 h-3" /> Depends on previous milestone
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 flex-wrap">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted capitalize">{status.replace('-', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
