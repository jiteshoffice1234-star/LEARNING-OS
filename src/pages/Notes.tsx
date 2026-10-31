import { useState } from 'react';
import { FileText, Plus, Search, Tag, Archive, Clock, BookOpen } from 'lucide-react';
import { notes } from '../data/mockData';

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = [...new Set(notes.flatMap(n => n.tags))];
  
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         n.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || n.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Notes & Library</h1>
          <p className="text-sm text-muted mt-1">Your study notes and resources</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Note</span>
        </button>
      </div>

      {/* Search and Tags */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-elevated/50 rounded-lg px-3 py-2 border border-border/50">
          <Search className="w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-text placeholder:text-muted outline-none w-full"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button 
          onClick={() => setSelectedTag(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            !selectedTag ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button 
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedTag === tag ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
            }`}
          >
            <Tag className="w-3 h-3" />
            {tag}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div key={note.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <button className="p-1.5 rounded-lg hover:bg-elevated text-muted opacity-0 group-hover:opacity-100 transition-all">
                <Archive className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-sm font-semibold text-text mb-1 line-clamp-2">{note.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-3 h-3 text-muted" />
              <span className="text-xs text-muted">{note.subject}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 flex-wrap">
                {note.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-elevated text-muted">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted">
                <Clock className="w-3 h-3" />
                {note.date}
              </div>
            </div>
          </div>
        ))}

        {/* Add Note Card */}
        <div className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors min-h-[160px]">
          <Plus className="w-6 h-6 text-muted" />
          <span className="text-xs text-muted">New Note</span>
        </div>
      </div>

      {/* Bookmarks Section */}
      <div className="mt-8 glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text mb-4">Bookmarked Resources</h3>
        <div className="space-y-2">
          {[
            { title: 'MIT OCW - Algorithms', url: 'ocw.mit.edu', type: 'Course' },
            { title: '3Blue1Brown - Neural Networks', url: 'youtube.com', type: 'Video' },
            { title: 'PostgreSQL Documentation', url: 'postgresql.org/docs', type: 'Docs' },
          ].map((resource, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30 hover:bg-elevated/50 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text truncate">{resource.title}</p>
                <p className="text-xs text-muted">{resource.url}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-elevated text-muted">{resource.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
