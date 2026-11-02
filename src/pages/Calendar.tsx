import { useState } from 'react';
import { usePersistentState, isDataWiped } from '../lib/storage';
import Modal from '../components/Modal';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { todayISO, addDaysISO } from '../lib/dates';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'revision' | 'exam' | 'milestone' | 'event';
  color: string;
  description?: string;
}

const typeConfig: Record<string, { label: string; color: string }> = {
  revision: { label: 'Revision', color: '#8170ED' },
  exam: { label: 'Exam', color: '#E16F79' },
  milestone: { label: 'Milestone', color: '#E5AA55' },
  event: { label: 'Event', color: '#43B889' },
};

const initialEvents: CalendarEvent[] = [];

function formatDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const wiped = isDataWiped();
  const [events, setEvents] = usePersistentState<CalendarEvent[]>('calendarEvents', wiped ? [] : initialEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [dayOpen, setDayOpen] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Add-event form state
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState<{ title: string; date: string; type: CalendarEvent['type']; time: string; description: string }>({ title: '', date: todayISO(), type: 'event', time: '', description: '' });

  const todayStr = todayISO();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDay = (dateStr: string) =>
    events.filter((e) => e.date === dateStr).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  // Week view days (Sunday to Saturday)
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const resetEventForm = () => setNewEvent({ title: '', date: todayStr, type: 'event', time: '', description: '' });

  const handleAddEvent = (forDate: string) => {
    if (!newEvent.title.trim()) return;
    const event: CalendarEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: newEvent.title.trim(),
      date: forDate,
      time: newEvent.time || undefined,
      type: newEvent.type,
      color: typeConfig[newEvent.type].color,
      description: newEvent.description.trim() || undefined,
    };
    setEvents([...events, event]);
    resetEventForm();
    setShowAdd(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
    if (dayOpen && getEventsForDay(dayOpen).length === 0) setDayOpen(null);
  };

  const requestDeleteEvent = (id: string) => {
    setConfirmDeleteId(id);
  };

  const doDeleteEvent = () => {
    if (!confirmDeleteId) return;
    handleDeleteEvent(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const openDay = (dateStr: string) => setDayOpen(dateStr);

  const dayDescription = dayOpen ? (getEventsForDay(dayOpen).length > 0 ? `${getEventsForDay(dayOpen).length} event(s)` : 'No events yet') : '';

  const headerControls = (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => setView('week')} className={`text-xs font-medium px-2 py-1 rounded ${view === 'week' ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text'}`}>Week</button>
      <button type="button" onClick={() => setView('month')} className={`text-xs font-medium px-2 py-1 rounded ${view === 'month' ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text'}`}>Month</button>
      <button type="button" onClick={() => { setView('month'); setCurrentDate(new Date()); }} className="text-xs text-muted hover:text-text">Today</button>
      <button type="button" onClick={() => { setShowAdd(true); setNewEvent((p) => ({ ...p, date: dayOpen ?? todayStr })); }} className="bg-primary text-white px-3 py-1.5 rounded">
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );

  const weekView = (
    <div className="glass-card rounded-xl p-3">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentDate(new Date(addDaysISO(formatDay(currentDate), -7)))} className="p-2 rounded-lg hover:bg-elevated"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="text-lg font-semibold text-text">{formatDay(weekDays[0])} to {formatDay(weekDays[6])}</h2>
        <button onClick={() => setCurrentDate(new Date(addDaysISO(formatDay(currentDate), 7)))} className="p-2 rounded-lg hover:bg-elevated"><ChevronRight className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((d) => {
          const dateStr = formatDay(d);
          const dayEvents = getEventsForDay(dateStr);
          const isToday = dateStr === todayStr;
          return (
            <div key={dateStr} className="flex flex-col h-[300px]">
              <div className={`flex items-center justify-between px-2 py-1.5 text-xs border-b border-border ${isToday ? 'bg-primary/10' : 'bg-elevated/30'}`}>
                <span className={`font-medium ${isToday ? 'text-primary' : 'text-text'}`}>{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <span className={`text-[10px] ${isToday ? 'text-primary' : 'text-muted'}`}>{dateStr.slice(5)}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-1 space-y-1">
                {dayEvents.length === 0 ? (
                  <div className="text-[10px] text-muted/50 text-center py-2">—</div>
                ) : (
                  dayEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-1.5 p-1.5 rounded-md bg-elevated/50 text-[10px]">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
                      <span className="truncate" title={event.title}>{event.title}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); requestDeleteEvent(event.id); }} className="ml-auto p-1 rounded text-muted hover:text-danger"><Trash2 className="w-2.5 h-2.5" /></button>
                    </div>
                  ))
                )}
                <button type="button" onClick={() => { setShowAdd(true); setNewEvent((p) => ({ ...p, date: dateStr })); }} className="w-full py-1 text-[10px] text-primary hover:bg-primary/5 rounded-md">+ Add</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const monthView = (
    <div className="glass-card rounded-xl p-3">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-lg hover:bg-elevated"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="text-lg font-semibold text-text">{monthName}</h2>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-lg hover:bg-elevated"><ChevronRight className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted py-2">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`blank-${i}`} className="aspect-square" />)}
        {days.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = getEventsForDay(dateStr);
          const isToday = dateStr === todayStr;
          return (
            <button key={day} type="button" onClick={() => openDay(dateStr)} className="aspect-square rounded-lg p-1 flex flex-col items-center justify-start hover:bg-elevated/50">
              <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-text'}`}>{day}</span>
              {isToday && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: event.color }} title={event.title} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-text">Calendar</h1>
          <p className="text-xs text-muted">Study schedule and events</p>
        </div>
        {headerControls}
      </div>

      {view === 'week' ? weekView : monthView}

      {/* Day Detail */}
      {dayOpen && (
        <Modal open onClose={() => setDayOpen(null)} title={dayOpen} description={dayDescription}>
          {getEventsForDay(dayOpen).map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30">
              <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${event.color}20` }}><CalIcon className="w-3.5 h-3.5" style={{ color: event.color }} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text font-medium truncate">{event.title}</p>
                <p className="text-[10px] text-muted">{typeConfig[event.type].label}{event.time ? ` • ${event.time}` : ''}</p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); requestDeleteEvent(event.id); }} aria-label={`Delete ${event.title}`} className="p-1.5 rounded text-muted hover:text-danger"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
          {getEventsForDay(dayOpen).length === 0 && <div className="text-center py-6 text-xs text-muted">No events on {dayOpen}. Add one below.</div>}
          <button type="button" onClick={() => { setShowAdd(true); setNewEvent((p) => ({ ...p, date: dayOpen })); }} className="mt-4 flex-1 px-4 py-2.5 rounded-lg bg-primary text-white">Add Event</button>
          <button type="button" onClick={() => setDayOpen(null)} className="mt-2 flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text">Close</button>
        </Modal>
      )}

      {/* Add Event Form */}
      {showAdd && (
        <Modal open onClose={() => { setShowAdd(false); resetEventForm(); }} title="New Event" description="Schedule a study event or reminder.">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Title *</label>
              <input
                type="text"
                placeholder="e.g. Algorithms Midterm"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Type</label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
              >
                {Object.entries(typeConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                placeholder="Add details…"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows={2}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => { setShowAdd(false); resetEventForm(); }} className="flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors">Cancel</button>
              <button type="button" onClick={() => handleAddEvent(newEvent.date)} disabled={!newEvent.title.trim()} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors">Create Event</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upcoming Events */}
      <div className="mt-3 glass-card rounded-xl p-3">
        <h3 className="text-xs font-semibold text-text mb-2">Upcoming Events</h3>
        <div className="space-y-1">
          {[...events].sort((a, b) => a.date.localeCompare(b.date)).filter(e => e.date >= todayStr).slice(0, 8).map((event) => (
            <div key={event.id} className="flex items-center gap-2 p-2 rounded-md bg-elevated/30">
              <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${event.color}20` }}><CalIcon className="w-3.5 h-3.5" style={{ color: event.color }} /></div>
              <div className="flex-1 min-w-0"><p className="text-xs text-text font-medium truncate">{event.title}</p><p className="text-[10px] text-muted">{event.date}</p></div>
              <button type="button" onClick={(e) => { e.stopPropagation(); requestDeleteEvent(event.id); }} className="p-1 rounded text-muted hover:text-danger"><Trash2 className="w-2.5 h-2.5" /></button>
            </div>
          ))}
          {events.filter(e => e.date >= todayStr).length === 0 && <p className="text-xs text-muted text-center py-2">No upcoming events.</p>}
        </div>
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          open={true}
          title="Delete event?"
          message="This will permanently remove this event from your calendar."
          confirmLabel="Delete"
          onConfirm={doDeleteEvent}
          onClose={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
