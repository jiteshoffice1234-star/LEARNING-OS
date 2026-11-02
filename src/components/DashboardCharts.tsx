import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import type { StudySession } from '../lib/study';
import { weekSeries, monthSeries, readDailyTarget } from '../lib/study';

/**
 * Dashboard charts, kept in their own module so recharts (~400 kB) is loaded
 * on demand instead of being bundled into the initial page load. All data is
 * derived from real study sessions in persistent storage.
 */

const GRID = '#2A2F3A';
const AXIS_TICK = { fill: '#9295A3', fontSize: 11 };

interface WeeklyStudyChartProps {
  sessions: StudySession[];
  dailyTarget: number;
}

/** Weekly study hours vs target — the large chart on the dashboard. */
export function WeeklyStudyChart({ sessions, dailyTarget }: WeeklyStudyChartProps) {
  const data = weekSeries(sessions, 7, dailyTarget);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8170ED" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8170ED" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={AXIS_TICK} />
        <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK} />
        <Tooltip
          contentStyle={{ background: '#191C24', border: `1px solid ${GRID}`, borderRadius: '8px', fontSize: '12px' }}
          labelStyle={{ color: '#E8E8EF' }}
          itemStyle={{ color: '#8170ED' }}
        />
        <Area type="monotone" dataKey="hours" stroke="#8170ED" strokeWidth={2} fill="url(#colorHours)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Small month-over-month bar chart shown under Recent Achievements. */
interface MonthlyTrendChartProps {
  sessions: StudySession[];
}

export function MonthlyTrendChart({ sessions }: MonthlyTrendChartProps) {
  const data = monthSeries(sessions, 4);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ ...AXIS_TICK, fontSize: 10 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ ...AXIS_TICK, fontSize: 10 }} />
        <Tooltip
          contentStyle={{ background: '#191C24', border: `1px solid ${GRID}`, borderRadius: '8px', fontSize: '11px' }}
          labelStyle={{ color: '#E8E8EF' }}
        />
        <Bar dataKey="hours" fill="#8170ED" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
