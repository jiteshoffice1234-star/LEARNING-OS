import { useState } from 'react';
import { 
  Brain, Plus, Search, Tag, Link2, BookOpen, Lightbulb, 
  ExternalLink, Archive, Star, Filter
} from 'lucide-react';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'concept' | 'fact' | 'resource' | 'insight';
  tags: string[];
  source?: string;
  starred: boolean;
  createdAt: string;
  linkedTo?: string[];
}

const initialKnowledge: KnowledgeItem[] = [
  { id: '1', title: 'Big O Notation Cheat Sheet', content: 'O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)', type: 'concept', tags: ['algorithms', 'complexity'], starred: true, createdAt: '2026-10-28', linkedTo: ['Algorithms'] },
  { id: '2', title: 'SOLID Principles', content: 'Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion', type: 'concept', tags: ['design', 'oop'], starred: true, createdAt: '2026-10-25', linkedTo: ['Software Engineering'] },
  { id: '3', title: 'AWS Free Tier Limits', content: 'EC2: 750 hrs/mo, S3: 5GB, Lambda: 1M requests, RDS: 750 hrs/mo', type: 'fact', tags: ['aws', 'cloud'], starred: false, createdAt: '2026-10-22' },
  { id: '4', title: 'Best ML Course Resources', content: 'Andrew Ng (Coursera), Fast.ai, Stanford CS229, 3Blue1Brown neural networks', type: 'resource', tags: ['ml', 'resources'], starred: true, createdAt: '2026-10-20', linkedTo: ['Machine Learning'] },
  { id: '5', title: 'Key Insight: Consistency > Intensity', content: 'Studying 1 hour daily beats 7 hours once a week. Spaced repetition leverages this.', type: 'insight', tags: ['learning', 'productivity'], starred: false, createdAt: '2026-10-18' },
  { id: '6', title: 'SQL Window Functions', content: 'ROW_NUMBER(), RANK(), DENSE_RANK(), LEAD(), LAG(), SUM() OVER()', type: 'concept', tags: ['sql', 'database'], starred: false, createdAt: '2026-10-15', linkedTo: ['Database Systems'] },
  { id: '7', title: 'Design Patterns to Know', content: 'Singleton, Factory, Observer, Strategy, Adapter, Decorator, Facade, Proxy', type: 'concept', tags: ['design', 'patterns'], starred: true, createdAt: '2026-10-12' },
  { id: '8', title: 'Linux Commands Reference', content: 'grep, awk, sed, find, xargs, curl, ssh, chmod, ps, top, netstat', type: 'resource', tags: ['linux', 'devops'], starred: false, createdAt: '2026-10-10' },
];

const typeConfig = {
  concept: { icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/15', label: 'Concept' },
  fact: { icon: BookOpen, color: 'text-success', bg: 'bg-success/15', label: 'Fact' },
  resource: { icon: Link2, color: 'text-accent', bg: 'bg-accent/15', label: 'Resource' },
  insight: { icon: Star, color: 'text-warning', bg: 'bg-warning/15', label: 'Insight' },
};

export default function Knowledge() {
  const [items, setItems] = useState(initialKnowledge);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = [...new Set(items.flatMap(i => i.tags))];
  
  const filtered = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesTag = !selectedTag || item.tags.includes(selectedTag);
    return matchesSearch && matchesType && matchesTag;
  });

  const toggleStar = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, starred: !i.starred } : i));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Knowledge Base
          </h1>
          <p className="text-sm text-muted mt-1">Your personal knowledge graph</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Item</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-text">{items.length}</p>
          <p className="text-xs text-muted">Total Items</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-primary">{items.filter(i => i.type === 'concept').length}</p>
          <p className="text-xs text-muted">Concepts</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-warning">{items.filter(i => i.starred).length}</p>
          <p className="text-xs text-muted">Starred</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-2xl font-bold text-success">{allTags.length}</p>
          <p className="text-xs text-muted">Tags</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-elevated/50 rounded-lg px-3 py-2 border border-border/50">
          <Search className="w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search knowledge..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-text placeholder:text-muted/50 outline-none w-full"
          />
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <button 
          onClick={() => setSelectedType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            selectedType === 'all' ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
          }`}
        >
          All
        </button>
        {Object.entries(typeConfig).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedType === type ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {allTags.slice(0, 10).map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedTag === tag ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
            }`}
          >
            <Tag className="w-2.5 h-2.5" />
            {tag}
          </button>
        ))}
      </div>

      {/* Knowledge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((item) => {
          const typeInfo = typeConfig[item.type];
          const TypeIcon = typeInfo.icon;
          return (
            <div key={item.id} className="glass-card rounded-xl p-4 hover:border-primary/20 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeInfo.bg}`}>
                  <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                </div>
                <button 
                  onClick={() => toggleStar(item.id)}
                  className={`p-1 rounded transition-colors ${item.starred ? 'text-warning' : 'text-muted hover:text-warning'}`}
                >
                  <Star className="w-3.5 h-3.5" fill={item.starred ? 'currentColor' : 'none'} />
                </button>
              </div>
              <h3 className="text-sm font-semibold text-text mb-2 line-clamp-1">{item.title}</h3>
              <p className="text-xs text-muted line-clamp-2 mb-3">{item.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 flex-wrap">
                  {item.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-elevated/50 text-muted">
                      #{tag}
                    </span>
                  ))}
                </div>
                {item.linkedTo && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {item.linkedTo[0]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Brain className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-muted">No knowledge items found</p>
        </div>
      )}
    </div>
  );
}
