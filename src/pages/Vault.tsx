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
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Achievement Vault</h1>
          <p className="text-sm text-muted mt-1">Your certificates, achievements and documents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-text">{achievements.length}</p>
          <p className="text-xs text-muted">Total Items</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-success">{achievements.filter(a => a.verified).length}</p>
          <p className="text-xs text-muted">Verified</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-primary">3</p>
          <p className="text-xs text-muted">This Year</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-warning">2.4 MB</p>
          <p className="text-xs text-muted">Storage Used</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-elevated/50 rounded-lg px-3 py-2 border border-border/50">
          <Search className="w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search certificates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-text placeholder:text-muted outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <div key={achievement.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-1">
                {achievement.verified && (
                  <span className="flex items-center gap-1 text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>
            <h3 className="text-sm font-semibold text-text mb-1 line-clamp-2">{achievement.title}</h3>
            <p className="text-xs text-muted mb-3">{achievement.issuer}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-elevated text-muted">
                  {achievement.category}
                </span>
                <span className="text-xs text-muted">{achievement.date}</span>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-text opacity-0 group-hover:opacity-100 transition-all">
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload Card */}
        <div className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 p-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors min-h-[200px]">
          <div className="w-12 h-12 rounded-xl bg-elevated/50 flex items-center justify-center">
            <Upload className="w-5 h-5 text-muted" />
          </div>
          <div className="text-center">
            <p className="text-sm text-text font-medium">Upload Document</p>
            <p className="text-xs text-muted mt-1">PDF, JPG, PNG, DOC up to 25MB</p>
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
