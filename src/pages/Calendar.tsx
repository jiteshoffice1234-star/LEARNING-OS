import { useState } from 'react';
import { usePersistentState, isDataWiped, readValue } from '../lib/storage';
import Modal from '../components/Modal';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, Trash2 } from 'lucide-react';

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

const initialEvents: CalendarEvent[] = [
  { id: '1', title: 'Algorithm Revision', date: '2026-11-02', type: 'revision', color: '#8170ED' },
  { id: '2', title: 'ML Quiz', date: '2026-11-05', type: 'exam', color: '#E16F79' },
  { id: '3', title: 'Project Deadline', date: '2026-11-08', type: 'milestone', color: '#E5AA55' },
  { id: '4', title: 'DB Revision', date: '2026-11-03', type: 'revision', color: '#8170ED' },
  { id: '5', title: 'Study Group', date: '2026-11-04', type: 'event', color: '#43B889' },
];

export default function CalendarPage() {
  const wiped = isDataWiped();
  const [events, setEvents] = usePersistentState<CalendarEvent[]>('calendarEvents', wiped ? [] : initialEvents);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1));
  const [view, setView] = useState<'month' | 'week'>('month');
  const [dayOpen, setDayOpen] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDay = (dateStr: string) =>
    events.filter((e) => e.date === dateStr).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const formatDay = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const todayStr = formatDay(new Date());

  // Calculate streak from stored test dates
  const calendarEvents = wiped ? [] : readValue<{ date: string }[]>('calendarEvents', []);
  const sortedDates = calendarEvents.map(e => e.date).sort().reverse();
  let streak = 0;
  let bestStreak = 0;
  let totalStudyDays = sortedDates.length;
  if (sortedDates.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    let checkDate = new Date(today);
    let foundToday = false;
    let currentStreak = 0;
    let best = 0;
    let tempStreak = 0;
    let prevDate: string | null = null;

    for (const d of sortedDates) {
      if (prevDate === null) {
        tempStreak = 1;
        prevDate = d;
      } else {
        const prev = new Date(prevDate);
        const curr = new Date(d);
        const diffDays = Math.ceil((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          best = Math.max(best, tempStreak);
          tempStreak = 1;
        }
        prevDate = d;
      }
    }
    best = Math.max(best, tempStreak);
    bestStreak = best;

    // Check if today is in the dates to count current streak
    if (sortedDates.includes(today)) {
      streak = tempStreak;
    } else {
      // Check if yesterday is in dates - if so, streak continues from yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      if (sortedDates.includes(yesterdayStr)) {
        streak = tempStreak;
      } else {
        streak = 0;
      }
    }
  }

  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState<{ title: string; date: string; type: CalendarEvent['type']; time: string; description: string }>({ title: '', date: todayStr, type: 'event', time: '', description: '' });

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

  const openDay = (dateStr: string) => setDayOpen(dateStr);

  const weekDays: Date[] = (() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay());
    const out: Date[] = [];
    for (let i = 0; i < 7; i++) { out.push(new Date(d)); d.setDate(d.getDate() + 1); }
    return out;
  })();

  const dayDescription = dayOpen ? (getEventsForDay(dayOpen).length > 0 ? `${getEventsForDay(dayOpen).length} event(s)` : 'No events yet') : '';

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-text">Calendar</h1>
          <p className="text-xs text-muted">Study schedule and events</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setView('week')} className="text-xs font-medium">Week</button>
          <button type="button" onClick={() => setView('month')} className="text-xs font-medium">Month</button>
          <button type="button" onClick={() => { setShowAdd(true); }} className="bg-primary text-white px-3 py-1 rounded">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-3">
        <div className="flex items-center justify-between mb-6">
          <button type="button" onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-lg hover:bg-elevated"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-lg font-semibold text-text">{monthName}</h2>
          <button type="button" onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-lg hover:bg-elevated"><ChevronRight className="w-5 h-5" /></button>
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
                <span className="text-xs font-medium">{day}</span>
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

      {dayOpen && (
        <Modal open onClose={() => setDayOpen(null)} title={dayOpen} description={dayDescription}>
          {getEventsForDay(dayOpen).map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30">
              <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${event.color}20` }}><CalIcon className="w-3.5 h-3.5" style={{ color: event.color }} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text font-medium truncate">{event.title}</p>
                <p className="text-[10px] text-muted">{typeConfig[event.type].label}</p>
              </div>
              <button type="button" onClick={() => handleDeleteEvent(event.id)} aria-label={`Delete ${event.title}`} className="p-1.5 rounded text-muted hover:text-danger"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
          {getEventsForDay(dayOpen).length === 0 && <div className="text-center py-6 text-xs text-muted">No events on {dayOpen}. Add one below.</div>}
          <button type="button" onClick={() => { setShowAdd(true); }} className="mt-4 flex-1 px-4 py-2.5 rounded-lg bg-primary text-white">Add Event</button>
          <button type="button" onClick={() => setDayOpen(null)} className="mt-2 flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text">Close</button>
        </Modal>
      )}

      <div className="mt-3 glass-card rounded-xl p-3">
        <h3 className="text-xs font-semibold text-text mb-2">Upcoming Events</h3>
        <div className="space-y-1">
          {[...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8).map((event) => (
            <div key={event.id} className="flex items-center gap-2 p-2 rounded-md bg-elevated/30">
              <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${event.color}20` }}><CalIcon className="w-3.5 h-3.5" style={{ color: event.color }} /></div>
              <div className="flex-1 min-w-0"><p className="text-xs text-text font-medium truncate">{event.title}</p></div>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 glass-card rounded-xl p-3">
        <h3 className="text-xs font-semibold text-text mb-2">Study Streak</h3>
        <div className="flex items-center gap-4">
          <div className="text-center flex-1">
            <p className="text-xl font-bold text-primary">{streak}</p>
            <p className="text-[10px] text-muted">Current</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xl font-bold text-text">{bestStreak}</p>
            <p className="text-[10px] text-muted">Best</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xl font-bold text-success">{totalStudyDays}</p>
            <p className="text-[10px] text-muted">Total Days</p>
          </div>
        </div>
      </div>

      <Modal open={showAdd} onClose={() => { setShowAdd(false); resetEventForm(); }} title="New Event" description="Schedule a study event.">
        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Title *</label>
          <input type="text" placeholder="e.g. Algorithm Revision" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Date</label>
            <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Time (optional)</label>
            <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Type</label>
          <div className="flex gap-2">
            {(['revision', 'exam', 'milestone', 'event'] as const).map((t) => {
              const isActive = newEvent.type === t;
              const btnClass = `flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize ${isActive ? 'bg-primary text-white' : 'bg-elevated text-text'}`;
              return (
                <button key={t} type="button" onClick={() => setNewEvent({ ...newEvent, type: t })} className={btnClass}>{typeConfig[t].label}</button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Description (optional)</label>
          <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} rows={3} className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary resize-none" />
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={() => { setShowAdd(false); resetEventForm(); }} className="flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text">Cancel</button>
          <button type="button" onClick={() => handleAddEvent(newEvent.date)} disabled={!newEvent.title.trim()} className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white disabled:opacity-40">Create Event</button>
        </div>
      </Modal>
    </div>
  );
}
