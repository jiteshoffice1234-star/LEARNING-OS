import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { TrendingUp, Clock, BookOpen, Target, Award, Zap } from 'lucide-react';
import { isDataWiped, store } from '../lib/storage';
import {
  readSessions, readTests, readQualifications, sessionHours,
  activityDates, weekSeries, monthSeries, heatmapSeries,
} from '../lib/study';
import { todayISO } from '../lib/dates';

interface Test {
  id: string;
  name: string;
  subject: string;
  maxMarks: number;
  obtained: number;
  date: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  timeTaken: number;
  negativeMarking: boolean;
  type: 'mock' | 'subject' | 'chapter';
}

/**
 * Analytics — all metrics derived from real persistent storage.
 * Study hours come from studySessions (not tests.timeTaken).
 * Certificates come from qualifications (not test count).
 * Daily avg = total study hours / distinct active days.
 */
export default function Analytics() {
  const wiped = isDataWiped();
  const sessions = readSessions();
  const tests = store.get<Test[]>('tests', []);
  const qualifications = readQualifications();

  const totalHours = sessionHours(sessions);
  const activeDays = activityDates(sessions, tests);
  const dailyAvg = activeDays.length > 0
    ? Math.round((totalHours / activeDays.length) * 10) / 10
    : 0;
  const avgAccuracy = tests.length
    ? Math.round(tests.reduce((acc, t) => acc + (t.correct / t.totalQuestions * 100), 0) / tests.length)
    : 0;
  const bestScore = tests.length ? Math.max(...tests.map(t => (t.obtained / t.maxMarks) * 100)) : 0;
  const certificates = qualifications.filter(q => q.status === 'completed').length;

  if (wiped || (sessions.length === 0 && tests.length === 0)) {
    return (
      <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
        <div className="mb-3">
          <h1 className="text-xl font-bold text-text">Analytics</h1>
          <p className="text-xs text-muted">Your data has been cleared. Log study sessions and tests to see analytics here.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <StatCard label="Lifetime Hours" value="0h" color="primary" />
          <StatCard label="Daily Avg" value="0h" color="success" />
          <StatCard label="Accuracy" value="0%" color="warning" />
          <StatCard label="Certificates" value="0" color="accent" />
        </div>
        <div className="glass-card rounded-xl p-8 text-center py-16">
          <Clock className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-muted">No study data yet. Log sessions in the Timer or tests in Tests Center to see analytics.</p>
        </div>
      </div>
    );
  }

  // Performance trend: oldest → newest (from tests)
  const performanceData = [...tests]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t, i) => ({ test: `T${i + 1}`, score: Math.round((t.obtained / t.maxMarks) * 100) }));

  // Subject distribution from test scores
  const subjectMap: Record<string, { score: number[]; count: number }> = {};
  tests.forEach(t => {
    if (!subjectMap[t.subject]) subjectMap[t.subject] = { score: [], count: 0 };
    subjectMap[t.subject].score.push((t.obtained / t.maxMarks) * 100);
    subjectMap[t.subject].count++;
  });
  const subjectDistribution = Object.entries(subjectMap).map(([name, data]) => ({
    name,
    value: Math.round(data.score.reduce((a, b) => a + b, 0) / data.score.length),
    color: data.score.length > 0 ? '#8170ED' : '#9295A3',
  }));

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-xl font-bold text-text">Analytics</h1>
        <p className="text-xs text-muted">Learning performance insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <StatCard label="Lifetime Hours" value={`${totalHours.toFixed(1)}h`} color="primary" />
        <StatCard label="Daily Avg" value={`${dailyAvg}h`} subtext={`over ${activeDays.length} active day${activeDays.length !== 1 ? 's' : ''}`} color="success" />
        <StatCard label="Accuracy" value={`${avgAccuracy}%`} color="warning" />
        <StatCard label="Certificates" value={certificates.toString()} color="accent" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Performance Trend */}
        <div className="glass-card rounded-xl p-3">
          <h3 className="text-xs font-semibold text-text mb-0.5">Performance Trend</h3>
          <p className="text-[10px] text-muted mb-2">Test score over time</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" vertical={false} />
                <XAxis dataKey="test" axisLine={false} tickLine={false} tick={{ fill: '#9295A3', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9295A3', fontSize: 11 }} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{ background: '#191C24', border: '1px solid #2A2F3A', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#E8E8EF' }}
                />
                <Line type="monotone" dataKey="score" stroke="#8170ED" strokeWidth={2} dot={{ fill: '#8170ED', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="glass-card rounded-xl p-3">
          <h3 className="text-xs font-semibold text-text mb-0.5">Subject Distribution</h3>
          <p className="text-[10px] text-muted mb-2">Average test score by subject</p>
          <div className="h-40 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {subjectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#191C24', border: '1px solid #2A2F3A', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {subjectDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-text flex-1">{item.name}</span>
                  <span className="text-xs text-muted">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        {/* Weekly Hours */}
        <div className="lg:col-span-2 glass-card rounded-xl p-3">
          <h3 className="text-xs font-semibold text-text mb-0.5">Weekly Study Hours</h3>
          <p className="text-[10px] text-muted mb-2">Last 7 days</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekSeries(sessions)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9295A3', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9295A3', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#191C24', border: '1px solid #2A2F3A', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#E8E8EF' }}
                />
                <Bar dataKey="hours" fill="#8170ED" radius={[4, 4, 0, 0]} name="Actual" />
                <Bar dataKey="target" fill="#252A35" radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Progress */}
        <div className="glass-card rounded-xl p-3">
          <h3 className="text-xs font-semibold text-text mb-0.5">Monthly Hours</h3>
          <p className="text-[10px] text-muted mb-2">Last 4 months</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthSeries(sessions)}>
                <defs>
                  <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43B889" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#43B889" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9295A3', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9295A3', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#191C24', border: '1px solid #2A2F3A', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#E8E8EF' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#43B889" strokeWidth={2} fill="url(#colorMonthly)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Areas */}
      <div className="glass-card rounded-xl p-3">
        <h3 className="text-xs font-semibold text-text mb-2">Areas for Improvement</h3>
        <div className="space-y-1.5">
          {tests
            .filter(t => (t.correct / t.totalQuestions) * 100 < 70)
            .slice(0, 6)
            .map((t) => {
              const score = Math.round((t.correct / t.totalQuestions) * 100);
              return (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-elevated/30">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${score < 60 ? 'bg-danger/15' : 'bg-warning/15'}`}>
                    <Zap className={`w-4 h-4 ${score < 60 ? 'text-danger' : 'text-warning'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text">{t.subject}</p>
                    <p className="text-xs text-muted">{t.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text">{score}%</p>
                    <p className="text-[10px] text-muted">{t.date}</p>
                  </div>
                </div>
              );
            })}
          {tests.filter(t => (t.correct / t.totalQuestions) * 100 < 70).length === 0 && (
            <p className="text-xs text-muted text-center py-4">No weak areas — great work!</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, color }: { label: string; value: string; subtext?: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/15 text-primary',
    accent: 'bg-accent/15 text-accent',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
  };

  return (
    <div className="glass-card rounded-lg p-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted">{label}</span>
      </div>
      <p className="text-lg font-bold text-text">{value}</p>
      {subtext && <p className="text-[10px] text-muted">{subtext}</p>}
    </div>
  );
}
