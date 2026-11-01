import { useState } from 'react';
import { usePersistentState, isDataWiped } from '../lib/storage';
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
      {/* Header */}
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

      {/* Calendar Grid */}
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

      {/* Day Detail */}
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

      {/* Upcoming Events */}
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
    </div>
  );
}
