import { useState } from 'react';
import { Brain, Plus, TrendingUp, Clock, Target, Award } from 'lucide-react';
import { skills, skillCategories, roadmapItems } from '../data/mockData';

const levelLabels = ['Not Started', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
const levelColors = ['#4A4E5A', '#E16F79', '#E5AA55', '#A99BFF', '#8170ED', '#43B889'];

export default function Skills() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const filteredSkills = selectedCategory === 'All' 
    ? skills 
    : skills.filter(s => s.category === selectedCategory);

  if (selectedSkill) {
    const skill = skills.find(s => s.id === selectedSkill);
    const relatedRoadmap = roadmapItems.filter(r => r.skill === skill?.name);
    
    return (
      <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        <button 
          onClick={() => setSelectedSkill(null)}
          className="flex items-center gap-1 text-sm text-muted hover:text-text mb-4 transition-colors"
        >
          ← Back to skills
        </button>
        
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-text">{skill?.name}</h2>
              <p className="text-sm text-muted mt-1">{skill?.category} • Started {skill?.startDate}</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${levelColors[skill?.level || 0]}20`, color: levelColors[skill?.level || 0] }}>
              {levelLabels[skill?.level || 0]}
            </span>
          </div>

          {/* Proficiency Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Proficiency</span>
              <span className="text-sm text-text">{skill?.level}/5 → Target: {skill?.targetLevel}/5</span>
            </div>
            <div className="relative h-3 bg-elevated rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ 
                  width: `${((skill?.level || 0) / 5) * 100}%`,
                  background: `linear-gradient(90deg, ${levelColors[skill?.level || 0]}, ${levelColors[Math.min((skill?.level || 0) + 1, 5)]})`
                }} 
              />
              <div 
                className="absolute top-0 h-full w-0.5 bg-white/30" 
                style={{ left: `${((skill?.targetLevel || 0) / 5) * 100}%` }}
                title="Target"
              />
            </div>
            <div className="flex justify-between mt-1">
              {levelLabels.map((label, i) => (
                <span key={i} className={`text-[9px] ${(skill?.level || 0) >= i ? 'text-text' : 'text-muted/50'}`}>
                  {label.charAt(0)}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-elevated/30">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-text">{skill?.hours}h</p>
              <p className="text-[10px] text-muted">Learning Hours</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-elevated/30">
              <Target className="w-4 h-4 text-success mx-auto mb-1" />
              <p className="text-lg font-bold text-text">{skill?.targetLevel}</p>
              <p className="text-[10px] text-muted">Target Level</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-elevated/30">
              <TrendingUp className="w-4 h-4 text-warning mx-auto mb-1" />
              <p className="text-lg font-bold text-text">{Math.round(((skill?.level || 0) / (skill?.targetLevel || 1)) * 100)}%</p>
              <p className="text-[10px] text-muted">To Target</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-elevated/30">
              <Award className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-lg font-bold text-text">2</p>
              <p className="text-[10px] text-muted">Certificates</p>
            </div>
          </div>
        </div>

        {/* Roadmap */}
        {relatedRoadmap.length > 0 && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text mb-4">Learning Roadmap</h3>
            <div className="space-y-3">
              {relatedRoadmap.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.status === 'on-track' ? 'bg-success/15' : 'bg-warning/15'
                  }`}>
                    <Target className={`w-4 h-4 ${item.status === 'on-track' ? 'text-success' : 'text-warning'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text">{item.milestone}</p>
                    <p className="text-xs text-muted">Target: {item.targetDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text">{item.progress}%</p>
                    <div className="w-16 h-1 bg-elevated rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Skills</h1>
          <p className="text-sm text-muted mt-1">Track your skill development journey</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Skill</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-text">{skills.length}</p>
          <p className="text-xs text-muted">Total Skills</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-success">{skills.filter(s => s.status === 'learning').length}</p>
          <p className="text-xs text-muted">Active Learning</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-primary">{skills.reduce((acc, s) => acc + s.hours, 0)}h</p>
          <p className="text-xs text-muted">Total Hours</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-warning">{skills.filter(s => s.level >= 4).length}</p>
          <p className="text-xs text-muted">Advanced+</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button 
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'All' ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
          }`}
        >
          All
        </button>
        {skillCategories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => (
          <div 
            key={skill.id}
            onClick={() => setSelectedSkill(skill.id)}
            className="glass-card rounded-xl p-5 cursor-pointer hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${levelColors[skill.level]}20` }}>
                  <Brain className="w-4 h-4" style={{ color: levelColors[skill.level] }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text">{skill.name}</h3>
                  <p className="text-[10px] text-muted">{skill.category}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Level {skill.level}/5</span>
              <span className="text-xs font-medium" style={{ color: levelColors[skill.level] }}>
                {levelLabels[skill.level]}
              </span>
            </div>
            <div className="h-1.5 bg-elevated rounded-full overflow-hidden mb-3">
              <div 
                className="h-full rounded-full transition-all" 
                style={{ width: `${(skill.level / 5) * 100}%`, backgroundColor: levelColors[skill.level] }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {skill.hours}h
              </span>
              <span>Target: {levelLabels[skill.targetLevel]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
