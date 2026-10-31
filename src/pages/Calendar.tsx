import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { calendarEvents } from '../data/mockData';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Nov 2026
  const [view, setView] = useState<'month' | 'week'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarEvents.filter(e => e.date === dateStr);
  };

  const today = 31; // Simulated current day (Oct 31)
  const isCurrentMonth = month === 9 && year === 2026; // October 2026

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-text">Calendar</h1>
          <p className="text-xs text-muted">Study schedule and events</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setView('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              view === 'week' ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text'
            }`}
          >
            Week
          </button>
          <button 
            onClick={() => setView('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              view === 'month' ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="glass-card rounded-xl p-3">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-elevated text-muted hover:text-text transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-text">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-elevated text-muted hover:text-text transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const events = getEventsForDay(day);
            const isToday = isCurrentMonth && day === today;
            return (
              <div 
                key={day} 
                className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start cursor-pointer transition-all hover:bg-elevated/50 ${
                  isToday ? 'bg-primary/15 ring-1 ring-primary/40' : ''
                }`}
              >
                <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-text'}`}>
                  {day}
                </span>
                {events.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {events.slice(0, 3).map((event) => (
                      <div 
                        key={event.id} 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: event.color }}
                        title={event.title}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="mt-3 glass-card rounded-xl p-3">
        <h3 className="text-xs font-semibold text-text mb-2">Upcoming Events</h3>
        <div className="space-y-1">
          {calendarEvents.map((event) => (
            <div key={event.id} className="flex items-center gap-2 p-2 rounded-md bg-elevated/30 hover:bg-elevated/50 transition-colors">
              <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${event.color}20` }}>
                <CalIcon className="w-3.5 h-3.5" style={{ color: event.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text font-medium truncate">{event.title}</p>
                <p className="text-[10px] text-muted">{event.date} • {event.type}</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
            </div>
          ))}
        </div>
      </div>

      {/* Study Streak */}
      <div className="mt-3 glass-card rounded-xl p-3">
        <h3 className="text-xs font-semibold text-text mb-2">Study Streak</h3>
        <div className="flex items-center gap-4">
          <div className="text-center flex-1">
            <p className="text-xl font-bold text-primary">42</p>
            <p className="text-[10px] text-muted">Current</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xl font-bold text-text">56</p>
            <p className="text-[10px] text-muted">Best</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xl font-bold text-success">187</p>
            <p className="text-[10px] text-muted">Total Days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
