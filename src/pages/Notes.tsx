import { useState } from 'react';
import { FileText, Plus, Search, Tag, Archive, Clock, BookOpen, X, Edit2, ExternalLink } from 'lucide-react';
import { notes as seedNotes } from '../data/mockData';
import { usePersistentState } from '../lib/storage';
import Modal, { ModalActions } from '../components/Modal';

interface Note {
  id: string;
  title: string;
  subject: string;
  date: string;
  tags: string[];
}

export default function Notes() {
  const [notes, setNotes] = usePersistentState<Note[]>('notes', seedNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newTags, setNewTags] = useState('');

  // Edit note state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editTags, setEditTags] = useState('');

  const allTags = [...new Set(notes.flatMap(n => n.tags))];

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         n.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || n.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      subject: newSubject.trim() || 'General',
      date: new Date().toISOString().split('T')[0],
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
    };
    setNotes([note, ...notes]);
    setNewTitle('');
    setNewSubject('');
    setNewTags('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditSubject(note.subject);
    setEditTags(note.tags.join(', '));
  };

  const handleSaveEdit = () => {
    if (!editingNote || !editTitle.trim()) return;
    setNotes(notes.map(n => n.id === editingNote.id ? { ...n, title: editTitle.trim(), subject: editSubject.trim() || 'General', tags: editTags.split(',').map(t => t.trim()).filter(Boolean) } : n));
    setEditingNote(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Notes & Library</h1>
          <p className="text-sm text-muted mt-1">Your study notes and resources</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
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
          <div key={note.id} className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all group relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                title="Delete note"
                className="p-1.5 rounded-lg hover:bg-danger/15 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openEdit(note); }}
              aria-label={`Open note: ${note.title}`}
              className="w-full"
            >
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
            </button>
            </div>
        ))}

        {/* Add Note Card */}
        <div 
          onClick={() => setShowAdd(true)}
          className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors min-h-[160px]"
        >
          <Plus className="w-6 h-6 text-muted" />
          <span className="text-xs text-muted">New Note</span>
        </div>
      </div>

      {/* New Note Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAdd(false)} />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">New Note</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-elevated text-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Graph Traversal Algorithms"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Algorithms"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. graphs, dsa"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note dialog */}
      <Modal
        open={editingNote !== null}
        onClose={() => setEditingNote(null)}
        title="Edit Note"
        description="Update the note title, subject and tags."
        footer={
          <ModalActions
            onCancel={() => setEditingNote(null)}
            onSubmit={handleSaveEdit}
            submitLabel="Save Changes"
            submitDisabled={!editTitle.trim()}
          />
        }
      >
        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Title</label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Subject</label>
          <input
            type="text"
            value={editSubject}
            onChange={(e) => setEditSubject(e.target.value)}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Tags (comma separated)</label>
          <input
            type="text"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
          />
          <p className="text-[11px] text-muted mt-1">Separate tags with commas.</p>
        </div>
      </Modal>

      {/* Bookmarks Section */}
      <div className="mt-8 glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text mb-4">Bookmarked Resources</h3>
        <div className="space-y-2">
          {[
            { title: 'MIT OCW - Algorithms', url: 'https://ocw.mit.edu', type: 'Course' },
            { title: '3Blue1Brown - Neural Networks', url: 'https://youtube.com/@3blue1brown', type: 'Video' },
            { title: 'PostgreSQL Documentation', url: 'https://postgresql.org/docs', type: 'Docs' },
          ].map((resource, i) => (
            <a
              key={i}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30 hover:bg-elevated/50 hover:border-primary/40 border border-transparent transition-all block"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text truncate">{resource.title}</p>
                <p className="text-xs text-muted">{resource.url.replace(/^https?:\/\//, '')}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-elevated text-muted">{resource.type}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
