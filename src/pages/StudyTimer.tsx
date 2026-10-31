import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Clock, BookOpen, Zap } from 'lucide-react';
import { studySessions } from '../data/mockData';

export default function StudyTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('Algorithms & Data Structures');
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - (startTimeRef.current || Date.now()) - pausedTimeRef.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const handleStart = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setElapsed(0);
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (isRunning && isPaused) {
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsed(0);
  };

  const handleReset = () => {
    handleStop();
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const todayTotal = studySessions
    .filter(s => s.date === '2026-10-31')
    .reduce((acc, s) => acc + s.duration, 0);

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
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-elevated border border-border rounded-lg px-3 py-1.5 text-sm text-text focus:outline-none focus:border-primary transition-colors"
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
                  {isRunning ? (isPaused ? 'Paused' : 'In Progress') : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!isRunning ? (
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
                {isPaused ? (
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
            <p className="text-sm font-bold text-text">3</p>
            <p className="text-[10px] text-muted">Sessions</p>
          </div>
          <div className="glass-card rounded-lg p-2.5 text-center">
            <p className="text-sm font-bold text-text">92%</p>
            <p className="text-[10px] text-muted">Focus</p>
          </div>
        </div>

        {/* Session History */}
        <div className="glass-card rounded-xl p-3">
          <h3 className="text-xs font-semibold text-text mb-2">Recent Sessions</h3>
          <div className="space-y-1">
            {studySessions.slice(0, 6).map((session) => (
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
