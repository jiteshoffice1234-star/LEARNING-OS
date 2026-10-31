import { useState } from 'react';
import { Award, FileText, Image, CheckCircle2, Search, Filter, Upload, ExternalLink, Shield } from 'lucide-react';
import { achievements } from '../data/mockData';

export default function Vault() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Certification', 'Achievement', 'Education', 'Project'];
  
  const filteredAchievements = achievements.filter(a => {
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.issuer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-text">Achievement Vault</h1>
          <p className="text-xs text-muted">{achievements.length} items · 2.4 MB</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload</span>
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-text font-medium">{achievements.length}</span>
          <span className="text-[10px] text-muted">Total</span>
        </div>
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-success font-medium">{achievements.filter(a => a.verified).length}</span>
          <span className="text-[10px] text-muted">Verified</span>
        </div>
        <div className="glass-card rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-primary font-medium">3</span>
          <span className="text-[10px] text-muted">This Year</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2 bg-elevated/50 rounded-lg px-2.5 py-1.5 border border-border/50">
          <Search className="w-3.5 h-3.5 text-muted" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-text placeholder:text-muted outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-1">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                selectedCategory === cat ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filteredAchievements.map((achievement) => (
          <div key={achievement.id} className="glass-card rounded-lg p-3 hover:border-primary/30 transition-all group">
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center gap-1">
                {achievement.verified && (
                  <span className="flex items-center gap-0.5 text-[9px] text-success bg-success/10 px-1 py-0.5 rounded">
                    <Shield className="w-2.5 h-2.5" /> ✓
                  </span>
                )}
              </div>
            </div>
            <h3 className="text-xs font-semibold text-text mb-0.5 line-clamp-2">{achievement.title}</h3>
            <p className="text-[10px] text-muted mb-2 line-clamp-1">{achievement.issuer}</p>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted">{achievement.date}</span>
              <span className="text-[9px] px-1 py-0.5 rounded bg-elevated text-muted">
                {achievement.category}
              </span>
            </div>
          </div>
        ))}

        {/* Upload Card */}
        <div className="rounded-lg border border-dashed border-border hover:border-primary/40 p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors min-h-[120px]">
          <div className="w-8 h-8 rounded bg-elevated/50 flex items-center justify-center">
            <Upload className="w-4 h-4 text-muted" />
          </div>
          <div className="text-center">
            <p className="text-xs text-text font-medium">Upload</p>
            <p className="text-[10px] text-muted">PDF, JPG, PNG</p>
          </div>
        </div>
      </div>

      {/* Document Types */}
      <div className="mt-6 glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text mb-4">File Types</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: FileText, label: 'PDFs', count: 8, color: 'text-danger' },
            { icon: Image, label: 'Images', count: 12, color: 'text-success' },
            { icon: FileText, label: 'Documents', count: 4, color: 'text-primary' },
            { icon: Award, label: 'Certificates', count: 5, color: 'text-warning' },
          ].map((type) => (
            <div key={type.label} className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30">
              <type.icon className={`w-5 h-5 ${type.color}`} />
              <div>
                <p className="text-sm font-medium text-text">{type.count}</p>
                <p className="text-xs text-muted">{type.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
