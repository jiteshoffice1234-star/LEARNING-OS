import { 
  Clock, Target, Flame, TrendingUp, BookOpen, Award,
  ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { weeklyStudyData, courses, revisions, achievements, heatmapData } from '../data/mockData';

export default function Dashboard() {
  const todayHours = 3.5;
  const dailyTarget = 4;
  const streak = 42;
  const totalHours = 1247;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Good morning, Arjun 👋</h1>
          <p className="text-sm text-muted mt-1">You're on a {streak}-day streak. Keep it going!</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Today: Oct 31, 2026</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          icon={Clock} 
          label="Today's Study" 
          value={`${todayHours}h`} 
          subtext={`of ${dailyTarget}h target`}
          progress={(todayHours / dailyTarget) * 100}
          color="primary"
        />
        <StatCard 
          icon={Flame} 
          label="Current Streak" 
          value={`${streak} days`} 
          subtext="Personal best: 56"
          trend="up"
          color="warning"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Hours" 
          value={totalHours.toLocaleString()} 
          subtext="+28.5h this month"
          trend="up"
          color="success"
        />
        <StatCard 
          icon={Target} 
          label="Courses Active" 
          value="4" 
          subtext="68% avg progress"
          color="accent"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Study Chart */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text">Weekly Study Hours</h3>
              <p className="text-xs text-muted mt-0.5">29.9h / 28h target</p>
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
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyStudyData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8170ED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8170ED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9295A3', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9295A3', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: '#191C24', border: '1px solid #2A2F3A', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#E8E8EF' }}
                  itemStyle={{ color: '#8170ED' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#8170ED" strokeWidth={2} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Heatmap */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text mb-1">Activity Heatmap</h3>
          <p className="text-xs text-muted mb-4">Last 4 months</p>
          <div className="grid grid-cols-7 gap-1">
            {heatmapData.slice(-49).map((day, i) => {
              const intensity = day.hours === 0 ? 0 : day.hours < 2 ? 1 : day.hours < 4 ? 2 : day.hours < 6 ? 3 : 4;
              const colors = ['bg-elevated/50', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary/90'];
              return (
                <div 
                  key={i} 
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Course Progress */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">Course Progress</h3>
            <button className="text-xs text-primary hover:text-accent transition-colors">View all</button>
          </div>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course.color }} />
                    <span className="text-sm text-text">{course.name}</span>
                  </div>
                  <span className="text-xs text-muted">{course.progress}%</span>
                </div>
                <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${course.progress}%`, backgroundColor: course.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Revisions */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">Upcoming Revisions</h3>
            <button className="text-xs text-primary hover:text-accent transition-colors">View all</button>
          </div>
          <div className="space-y-3">
            {revisions.filter(r => r.status !== 'completed').slice(0, 5).map((rev) => (
              <div key={rev.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-elevated/30 hover:bg-elevated/50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  rev.status === 'overdue' ? 'bg-danger/15' : 'bg-primary/15'
                }`}>
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
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  rev.status === 'overdue' ? 'bg-danger/15 text-danger' : 'bg-primary/15 text-primary'
                }`}>
                  {rev.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Achievements & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text">Recent Achievements</h3>
            <button className="text-xs text-primary hover:text-accent transition-colors">View vault</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.slice(0, 4).map((ach) => (
              <div key={ach.id} className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30 border border-border/30">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text font-medium truncate">{ach.title}</p>
                  <p className="text-xs text-muted">{ach.issuer} • {ach.date}</p>
                </div>
                {ach.verified && <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text mb-4">Monthly Trend</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { month: 'Jul', hours: 95 },
                { month: 'Aug', hours: 110 },
                { month: 'Sep', hours: 88 },
                { month: 'Oct', hours: 105 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9295A3', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9295A3', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ background: '#191C24', border: '1px solid #2A2F3A', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ color: '#E8E8EF' }}
                />
                <Bar dataKey="hours" fill="#8170ED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <ArrowUpRight className="w-3 h-3 text-success" />
            <span className="text-xs text-success">+19% vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
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
    <div className="glass-card rounded-xl p-4 md:p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          </div>
        )}
      </div>
      <p className="text-xl md:text-2xl font-bold text-text">{value}</p>
      <p className="text-xs text-muted mt-1">{subtext}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1 bg-elevated rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
    </div>
  );
}
