import { Suspense, lazy } from 'react';
import {
  Clock, Target, Flame, TrendingUp, BookOpen, Award,
  ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { isDataWiped, store } from '../lib/storage';
import {
  readCourses, readSubjects, readSessions, readRevisions, readTests,
  readDailyTarget, sessionHours, hoursThisMonth, computeStreak,
  activityDates, weekSeries, monthSeries, heatmapSeries,
  subjectProgress, courseProgress, subjectCount,
} from '../lib/study';

// recharts is heavy (~400 kB) so the charts load on demand. The rest of the
// dashboard renders immediately; only the chart frames wait for their chunk.
const WeeklyStudyChart = lazy(() => import('../components/DashboardCharts').then(m => ({ default: m.WeeklyStudyChart })));
const MonthlyTrendChart = lazy(() => import('../components/DashboardCharts').then(m => ({ default: m.MonthlyTrendChart })));

/** Neutral placeholder that reserves the chart's space while it loads. */
function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={`${className ?? ''} animate-pulse rounded-lg bg-elevated/50`} aria-hidden="true" />
  );
}

/**
 * Dashboard — the landing page.
 * All metrics are derived from real persistent storage (courses, subjects,
 * studySessions, revisions, tests). Shows empty state after data wipe.
 */
export default function Dashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const wiped = isDataWiped();
  const courses = readCourses();
  const subjects = readSubjects();
  const sessions = readSessions();
  const revisions = readRevisions();
  const tests = readTests();
  const profile = store.get<{ name: string }>('profile', { name: 'Learner' });
  const dailyTarget = readDailyTarget();

  if (wiped) {
    return (
      <div className="p-3 md:p-4 lg:p-5 space-y-4 pb-20 md:pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <div>
            <h1 className="text-xl font-bold text-text">Good morning 👋</h1>
            <p className="text-xs text-muted">Your data has been cleared. Start adding content to see it here.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <StatCard icon={Clock} label="Today's Study" value="0h" subtext={`of ${dailyTarget}h target`} progress={0} color="primary" />
          <StatCard icon={Flame} label="Current Streak" value="0 days" subtext="Personal best: 0" trend="up" color="warning" />
          <StatCard icon={TrendingUp} label="Total Hours" value="0" subtext="0h this month" trend="up" color="success" />
          <StatCard icon={Target} label="Courses Active" value="0" subtext="0% avg progress" color="accent" />
        </div>
        <div className="glass-card rounded-xl p-8 text-center py-16">
          <Clock className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-muted">No data yet. Add courses, subjects, and log sessions to populate your dashboard.</p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayHours = hoursOnToday(sessions, tests);
  const totalHours = sessionHours(sessions);
  const monthHours = hoursThisMonth(sessions);
  const streak = computeStreak(activityDates(sessions, tests));
  const avgCourseProgress = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + courseProgress(c, subjects), 0) / courses.length)
    : 0;

  // Recalc revision statuses dynamically (overdue if dueDate < today and not completed)
  const nowDate = today;
  const activeRevisions = revisions.map(r => {
    const status = r.status === 'completed' ? 'completed'
      : r.dueDate < nowDate ? 'overdue' : 'upcoming';
    return { ...r, status };
  }).filter(r => r.status !== 'completed');

  return (
    <div className="p-3 md:p-4 lg:p-5 space-y-4 pb-20 md:pb-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        <div>
          <h1 className="text-xl font-bold text-text">Good morning, {profile.name || 'Learner'} 👋</h1>
          <p className="text-xs text-muted">{streak}-day streak · {today}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard 
          icon={Clock} 
          label="Today's Study" 
          value={`${todayHours}h`} 
          subtext={`of ${dailyTarget}h target`}
          progress={Math.min((todayHours / dailyTarget) * 100, 100)}
          color="primary"
        />
        <StatCard 
          icon={Flame} 
          label="Current Streak" 
          value={`${streak} days`} 
          subtext="Keep it going"
          trend="up"
          color="warning"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Hours" 
          value={totalHours.toLocaleString()} 
          subtext={monthHours > 0 ? `+${monthHours}h this month` : "0h this month"}
          trend="up"
          color="success"
        />
        <StatCard 
          icon={Target} 
          label="Courses Active" 
          value={courses.length.toString()} 
          subtext={`${avgCourseProgress}% avg progress`}
          color="accent"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Weekly Study Chart */}
        <div className="lg:col-span-2 glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-text">Weekly Study Hours</h3>
              <p className="text-xs text-muted mt-0.5">{totalHours.toFixed(1)}h / {dailyTarget * 7}h target this week</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-muted">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-muted/30" />
                <span className="text-muted">Target</span>
              </div>
            </div>
          </div>
          <div className="h-40">
            <Suspense fallback={<ChartSkeleton className="h-full w-full" />}>
              <WeeklyStudyChart sessions={sessions} dailyTarget={dailyTarget} />
            </Suspense>
          </div>
        </div>

        {/* Study Heatmap */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-text mb-1">Activity Heatmap</h3>
          <p className="text-xs text-muted mb-2">Last 7 weeks</p>
          <div className="grid grid-cols-7 gap-1">
            {heatmapSeries(sessions).map((day, i) => {
              const intensity = day.hours === 0 ? 0 : day.hours < 1 ? 1 : day.hours < 2 ? 2 : day.hours < 4 ? 3 : 4;
              const colors = ['bg-elevated/50', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary/90'];
              return (
                <div 
                  key={day.date}
                  className={`w-full aspect-square rounded-sm ${colors[intensity]} transition-colors hover:ring-1 hover:ring-primary/50`}
                  title={`${day.date}: ${day.hours}h`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3 text-[10px] text-muted">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-elevated/50" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/20" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/40" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/60" />
              <div className="w-2.5 h-2.5 rounded-sm bg-primary/90" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Course Progress & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Course Progress */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text">Course Progress</h3>
            <button
              onClick={() => onNavigate?.('study')}
              aria-label="View all courses in Study Center"
              className="text-xs text-primary hover:text-accent transition-colors"
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {courses.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">No courses yet. Add one in Study Center.</p>
            ) : (
              courses.map((course) => {
                const prog = courseProgress(course, subjects);
                const count = subjectCount(course, subjects);
                return (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course.color }} />
                        <span className="text-sm text-text">{course.name}</span>
                      </div>
                      <span className="text-xs text-muted">{prog}%</span>
                    </div>
                    <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${prog}%`, backgroundColor: course.color }}
                      />
                    </div>
                    <p className="text-[10px] text-muted">{count} subject{count !== 1 ? 's' : ''}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Revisions */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text">Upcoming Revisions</h3>
            <button
              onClick={() => onNavigate?.('revisions')}
              aria-label="View all revisions"
              className="text-xs text-primary hover:text-accent transition-colors"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {activeRevisions.slice(0, 5).map((rev) => (
              <div key={rev.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-elevated/30 hover:bg-elevated/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rev.status === 'overdue' ? 'bg-danger/15' : 'bg-primary/15'}`}>
                  {rev.status === 'overdue' ? (
                    <AlertCircle className="w-4 h-4 text-danger" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text truncate">{rev.subject}</p>
                  <p className="text-xs text-muted">Cycle {rev.cycle} • {rev.dueDate}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rev.status === 'overdue' ? 'bg-danger/15 text-danger' : 'bg-primary/15 text-primary'}`}>
                  {rev.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                </span>
              </div>
            ))}
            {activeRevisions.length === 0 && (
              <p className="text-xs text-muted text-center py-4">No upcoming revisions.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Achievements & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text">Subjects by Hours</h3>
            <button
              onClick={() => onNavigate?.('study')}
              aria-label="View all subjects in Study Center"
              className="text-xs text-primary hover:text-accent transition-colors"
            >
              View all
            </button>
          </div>
          <div className="space-y-2">
            {subjects.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">No subjects yet. Add one in Study Center.</p>
            ) : (
              [...subjects]
                .sort((a, b) => hoursForSubject(b.name, sessions) - hoursForSubject(a.name, sessions))
                .slice(0, 4)
                .map((subj) => {
                  const h = hoursForSubject(subj.name, sessions);
                  return (
                    <div key={subj.id} className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30 border border-border/30">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text font-medium truncate">{subj.name}</p>
                        <p className="text-xs text-muted">{h.toFixed(1)}h studied</p>
                      </div>
                      <span className="text-xs font-medium text-muted">{subj.progress}%</span>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-semibold text-text mb-3">Monthly Trend</h3>
          <div className="h-36">
            <Suspense fallback={<ChartSkeleton className="h-full w-full" />}>
              <MonthlyTrendChart sessions={sessions} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Hours studied today across sessions + test timeTaken. */
function hoursOnToday(sessions: { date: string; duration: number }[], tests: { date: string; timeTaken?: number }[]): number {
  const today = new Date().toISOString().slice(0, 10);
  const sessionHours = sessions
    .filter(s => s.date.slice(0, 10) === today)
    .reduce((sum, s) => sum + (Number(s.duration) || 0), 0) / 60;
  const testHours = tests
    .filter(t => t.date.slice(0, 10) === today)
    .reduce((sum, t) => sum + (Number(t.timeTaken) || 0), 0) / 60;
  return Math.round((sessionHours + testHours) * 10) / 10;
}

function hoursForSubject(name: string, sessions: { subject: string; duration: number }[]): number {
  return sessions
    .filter(s => s.subject === name)
    .reduce((sum, s) => sum + (Number(s.duration) || 0), 0) / 60;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
  progress?: number;
  trend?: 'up' | 'down';
  color: string;
}

function StatCard({ icon: Icon, label, value, subtext, progress, trend, color }: StatCardProps) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/15 text-primary',
    accent: 'bg-accent/15 text-accent',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
  };

  return (
    <div className="glass-card rounded-xl p-3 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          </div>
        )}
      </div>
      <p className="text-lg font-bold text-text">{value}</p>
      <p className="text-[11px] text-muted mt-0.5">{subtext}</p>
      {progress !== undefined && (
        <div className="mt-2 h-1 bg-elevated rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
    </div>
  );
}
