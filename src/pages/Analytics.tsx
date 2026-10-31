import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, Clock, BookOpen, Target, Award, Zap } from 'lucide-react';
import { subjectDistribution, performanceTrend, monthlyStudyData, weeklyStudyData } from '../data/mockData';

export default function Analytics() {
  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-xl font-bold text-text">Analytics</h1>
        <p className="text-xs text-muted">Learning performance insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="glass-card rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted">Lifetime Hours</span>
            <Clock className="w-3 h-3 text-primary" />
          </div>
          <p className="text-lg font-bold text-text">1,247</p>
          <p className="text-[10px] text-success flex items-center gap-0.5">
            <TrendingUp className="w-2.5 h-2.5" /> +28.5h
          </p>
        </div>
        <div className="glass-card rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted">Daily Avg</span>
            <BookOpen className="w-3 h-3 text-success" />
          </div>
          <p className="text-lg font-bold text-text">3.8h</p>
          <p className="text-[10px] text-muted">Last 30d</p>
        </div>
        <div className="glass-card rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted">Accuracy</span>
            <Target className="w-3 h-3 text-warning" />
          </div>
          <p className="text-lg font-bold text-text">82%</p>
          <p className="text-[10px] text-success flex items-center gap-0.5">
            <TrendingUp className="w-2.5 h-2.5" /> +4%
          </p>
        </div>
        <div className="glass-card rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted">Certificates</span>
            <Award className="w-3 h-3 text-accent" />
          </div>
          <p className="text-lg font-bold text-text">5</p>
          <p className="text-[10px] text-muted">3 this year</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Performance Trend */}
        <div className="glass-card rounded-xl p-3">
          <h3 className="text-xs font-semibold text-text mb-0.5">Performance Trend</h3>
          <p className="text-[10px] text-muted mb-2">Test accuracy over time</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9295A3', fontSize: 11 }} />
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
          <p className="text-[10px] text-muted mb-2">Time allocation by subject</p>
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
          <p className="text-[10px] text-muted mb-2">Actual vs Target</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStudyData}>
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
          <p className="text-[10px] text-muted mb-2">This month</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStudyData}>
                <defs>
                  <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43B889" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#43B889" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#9295A3', fontSize: 10 }} />
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

      {/* Skills Progress & Weak Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Skills Progress */}
        <div className="glass-card rounded-xl p-3">
          <h3 className="text-xs font-semibold text-text mb-2">Skill Proficiency</h3>
          <div className="space-y-1.5">
            {[
              { name: 'Python', level: 4, max: 5 },
              { name: 'JavaScript/TS', level: 4, max: 5 },
              { name: 'SQL & Databases', level: 3, max: 5 },
              { name: 'Cloud (AWS)', level: 3, max: 5 },
              { name: 'Machine Learning', level: 2, max: 5 },
              { name: 'System Design', level: 2, max: 5 },
            ].map((skill) => (
              <div key={skill.name} className="flex items-center gap-3">
                <span className="text-xs text-text w-28 truncate">{skill.name}</span>
                <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent" 
                    style={{ width: `${(skill.level / skill.max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted w-8 text-right">{skill.level}/{skill.max}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="glass-card rounded-xl p-3">
          <h3 className="text-xs font-semibold text-text mb-2">Areas for Improvement</h3>
          <div className="space-y-1.5">
            {[
              { topic: 'Dynamic Programming', subject: 'Algorithms', score: 55, trend: 'down' },
              { topic: 'Neural Networks', subject: 'ML', score: 62, trend: 'up' },
              { topic: 'Graph Algorithms', subject: 'Algorithms', score: 58, trend: 'stable' },
              { topic: 'Concurrency', subject: 'OS', score: 65, trend: 'up' },
              { topic: 'Normalization', subject: 'Databases', score: 70, trend: 'stable' },
            ].map((area) => (
              <div key={area.topic} className="flex items-center gap-3 p-2.5 rounded-lg bg-elevated/30">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  area.score < 60 ? 'bg-danger/15' : area.score < 70 ? 'bg-warning/15' : 'bg-success/15'
                }`}>
                  <Zap className={`w-4 h-4 ${
                    area.score < 60 ? 'text-danger' : area.score < 70 ? 'text-warning' : 'text-success'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text">{area.topic}</p>
                  <p className="text-xs text-muted">{area.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text">{area.score}%</p>
                  <p className={`text-[10px] ${
                    area.trend === 'up' ? 'text-success' : area.trend === 'down' ? 'text-danger' : 'text-muted'
                  }`}>
                    {area.trend === 'up' ? '↑ Improving' : area.trend === 'down' ? '↓ Declining' : '→ Stable'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
