import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Clock, BookOpen, Zap } from 'lucide-react';
import { usePersistentState } from '../lib/storage';
import { todayISO } from '../lib/dates';

interface Session {
  id: string;
  subject: string;
  date: string;
  /** Duration in minutes. */
  duration: number;
  type: 'deep' | 'revision';
}

/** Seed with the original demo history so the first run isn't empty. */
const initialSessions: Session[] = [
  { id: 's1', subject: 'Algorithms & Data Structures', date: '2026-10-31', duration: 120, type: 'deep' },
  { id: 's2', subject: 'Machine Learning', date: '2026-10-31', duration: 90, type: 'deep' },
  { id: 's3', subject: 'Operating Systems', date: '2026-10-30', duration: 60, type: 'revision' },
  { id: 's4', subject: 'Database Systems', date: '2026-10-30', duration: 150, type: 'deep' },
];

/** Persisted timer state so a running session survives a page refresh. */
interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  /** Epoch ms when the current run segment started. */
  startTime: number | null;
  /** Accumulated seconds from previous segments (before pause/restart). */
  baseElapsed: number;
  subject: string;
}

const initialTimer: TimerState = {
  isRunning: false,
  isPaused: false,
  startTime: null,
  baseElapsed: 0,
  subject: 'Algorithms & Data Structures',
};

export default function StudyTimer() {
  const [sessions, setSessions] = usePersistentState<Session[]>('studySessions', initialSessions);
  const [timer, setTimer] = usePersistentState<TimerState>('studyTimer', initialTimer);
  const [elapsed, setElapsed] = useState(0);
  const mountedRef = useRef(true);

  // Recompute elapsed from the persisted timer on mount (handles refresh).
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const compute = () => {
      if (timer.isRunning && !timer.isPaused && timer.startTime) {
        return timer.baseElapsed + Math.floor((Date.now() - timer.startTime) / 1000);
      }
      return timer.baseElapsed;
    };
    setElapsed(compute());

    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer.isRunning && !timer.isPaused) {
      interval = setInterval(() => {
        if (mountedRef.current) setElapsed(compute());
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timer.isRunning, timer.isPaused, timer.startTime, timer.baseElapsed]);

  const handleStart = () => {
    setTimer({ ...timer, isRunning: true, isPaused: false, startTime: Date.now(), baseElapsed: 0 });
  };

  const handlePause = () => {
    if (timer.isRunning && !timer.isPaused) {
      const nowElapsed = timer.baseElapsed + Math.floor((Date.now() - (timer.startTime ?? Date.now())) / 1000);
      setTimer({ ...timer, isPaused: true, baseElapsed: nowElapsed, startTime: null });
    }
  };

  const handleResume = () => {
    if (timer.isRunning && timer.isPaused) {
      setTimer({ ...timer, isPaused: false, startTime: Date.now() });
    }
  };

  /** Save the session to history if it ran ≥ 1 minute, then reset. */
  const saveSession = () => {
    const totalSeconds = timer.isRunning && !timer.isPaused && timer.startTime
      ? timer.baseElapsed + Math.floor((Date.now() - timer.startTime) / 1000)
      : timer.baseElapsed;
    const minutes = Math.round(totalSeconds / 60);
    if (minutes >= 1) {
      setSessions([
        {
          id: Date.now().toString(),
          subject: timer.subject,
          date: todayISO(),
          duration: minutes,
          type: 'deep',
        },
        ...sessions,
      ]);
    }
  };

  const handleStop = () => {
    saveSession();
    setTimer({ ...initialTimer, subject: timer.subject });
    setElapsed(0);
  };

  const handleReset = () => {
    // Reset discards the in-progress session without saving.
    setTimer({ ...initialTimer, subject: timer.subject });
    setElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const today = todayISO();
  const todaySessions = sessions.filter(s => s.date === today);
  const todayTotal = todaySessions.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-text">Study Timer</h1>
          <p className="text-xs text-muted">Track focused study sessions</p>
        </div>

        {/* Timer Card */}
        <div className="glass-card rounded-2xl p-5 md:p-8 text-center mb-4 glow-primary">
          {/* Subject Selector */}
          <div className="mb-5">
            <label className="text-[10px] text-muted uppercase tracking-wider mb-1.5 block">Current Subject</label>
            <select 
              value={timer.subject}
              onChange={(e) => setTimer({ ...timer, subject: e.target.value })}
              disabled={timer.isRunning && !timer.isPaused}
              className="bg-elevated border border-border rounded-lg px-3 py-1.5 text-sm text-text focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
            >
              <option>Algorithms & Data Structures</option>
              <option>Machine Learning</option>
              <option>Database Systems</option>
              <option>Operating Systems</option>
              <option>Computer Networks</option>
              <option>Python Programming</option>
            </select>
          </div>

          {/* Timer Display */}
          <div className="mb-5">
            <div className="relative inline-flex items-center justify-center">
              {/* Animated ring */}
              <svg className="w-48 h-48 md:w-56 md:h-56 -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#252A35" strokeWidth="4" />
                <circle 
                  cx="100" cy="100" r="90" fill="none" 
                  stroke="url(#timerGradient)" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - (elapsed % 3600) / 3600)}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8170ED" />
                    <stop offset="100%" stopColor="#A99BFF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-mono font-bold text-text tracking-wider">
                  {formatTime(elapsed)}
                </span>
                <span className="text-[10px] text-muted mt-1.5 uppercase tracking-wider">
                  {timer.isRunning ? (timer.isPaused ? 'Paused' : 'In Progress') : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!timer.isRunning ? (
              <button 
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
              >
                <Play className="w-4 h-4" />
                Start Session
              </button>
            ) : (
              <>
                <button 
                  onClick={handleReset}
                  className="p-2.5 rounded-lg bg-elevated text-muted hover:text-text hover:bg-elevated/80 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {timer.isPaused ? (
                  <button 
                    onClick={handleResume}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-success text-white font-medium text-sm hover:bg-success/90 transition-all"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </button>
                ) : (
                  <button 
                    onClick={handlePause}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-warning text-bg font-medium text-sm hover:bg-warning/90 transition-all"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                )}
                <button 
                  onClick={handleStop}
                  className="p-2.5 rounded-lg bg-elevated text-danger hover:bg-danger/15 transition-colors"
                >
                  <Square className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="glass-card rounded-lg p-2.5 text-center">
            <p className="text-sm font-bold text-text">{Math.floor(todayTotal / 60)}h {(todayTotal % 60)}m</p>
            <p className="text-[10px] text-muted">Today</p>
          </div>
          <div className="glass-card rounded-lg p-2.5 text-center">
            <p className="text-sm font-bold text-text">{todaySessions.length}</p>
            <p className="text-[10px] text-muted">Sessions</p>
          </div>
          <div className="glass-card rounded-lg p-2.5 text-center">
            <p className="text-sm font-bold text-text">{Math.floor(todayTotal / 60)}h</p>
            <p className="text-[10px] text-muted">Logged</p>
          </div>
        </div>

        {/* Session History */}
        <div className="glass-card rounded-xl p-3">
          <h3 className="text-xs font-semibold text-text mb-2">Recent Sessions</h3>
          <div className="space-y-1">
            {sessions.length === 0 && (
              <p className="text-xs text-muted text-center py-6">No sessions yet. Start a timer to log one.</p>
            )}
            {sessions.slice(0, 8).map((session) => (
              <div key={session.id} className="flex items-center gap-2 p-2 rounded-md bg-elevated/30 hover:bg-elevated/50 transition-colors">
                <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                  session.type === 'deep' ? 'bg-primary/15' : 'bg-accent/15'
                }`}>
                  <Clock className={`w-3 h-3 ${session.type === 'deep' ? 'text-primary' : 'text-accent'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text truncate">{session.subject}</p>
                  <p className="text-[10px] text-muted">{session.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-text">{Math.floor(session.duration / 60)}h{session.duration % 60}m</p>
                  <span className={`text-[9px] px-1 py-0.5 rounded-full ${
                    session.type === 'deep' ? 'bg-primary/15 text-primary' : 'bg-accent/15 text-accent'
                  }`}>
                    {session.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
