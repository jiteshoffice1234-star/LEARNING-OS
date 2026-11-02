import { readValue } from './storage';
import { addDaysISO, todayISO } from './dates';
import { studySessions as demoStudySessions } from '../data/mockData';

/**
 * Shared learning data model.
 *
 * Courses, subjects and study sessions are written by several pages
 * (Study Center, Timer, Dashboard). Keeping the shapes and the derived math in
 * one place means every page reports the same numbers and no page has to
 * invent its own demo data.
 */

export interface Course {
  id: string;
  name: string;
  color: string;
  progress: number;
  /** Legacy demo count — the live count is derived from `subjects`. */
  subjects?: number;
}

export interface Subject {
  id: string;
  courseId: string;
  name: string;
  progress: number;
  chapters: number;
  hours: number;
  /** Per-chapter completion, created the first time a chapter is toggled. */
  chapterDone?: boolean[];
}

export interface StudySession {
  id: string;
  subject: string;
  date: string;
  /** Duration in minutes. */
  duration: number;
  type: 'deep' | 'revision';
}

export interface RevisionRecord {
  id: string;
  subject: string;
  chapter?: string;
  cycle: number;
  dueDate: string;
  status: 'upcoming' | 'overdue' | 'completed' | 'postponed';
  interval?: number;
}

export interface TestRecord {
  id?: string;
  name?: string;
  subject?: string;
  date: string;
  timeTaken?: number;
  obtained?: number;
  maxMarks?: number;
}

export interface QualificationRecord {
  id: string;
  name: string;
  institution: string;
  status: string;
  year: string;
  grade: string;
  type?: string;
}

/** First-run demo history — shared so every page seeds the same sessions. */
export const DEMO_SESSIONS: StudySession[] = demoStudySessions as StudySession[];

export const COURSE_COLORS = ['#8170ED', '#43B889', '#E5AA55', '#E16F79', '#A99BFF', '#6EE7B7'];

export function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return COURSE_COLORS[Math.abs(hash) % COURSE_COLORS.length];
}

export function readCourses(): Course[] {
  return readValue<Course[]>('courses', []);
}

export function readSubjects(): Subject[] {
  return readValue<Subject[]>('subjects', []);
}

export function readSessions(): StudySession[] {
  return readValue<StudySession[]>('studySessions', []);
}

export function readRevisions(): RevisionRecord[] {
  return readValue<RevisionRecord[]>('revisions', []);
}

export function readTests(): TestRecord[] {
  return readValue<TestRecord[]>('tests', []);
}

export function readQualifications(): QualificationRecord[] {
  return readValue<QualificationRecord[]>('qualifications', []);
}

export function readDailyTarget(): number {
  const raw = readValue<number>('settings:dailyTarget', 4);
  return Number.isFinite(raw) && raw > 0 ? raw : 4;
}

/* ------------------------------------------------------------------ */
/* Derived values                                                      */
/* ------------------------------------------------------------------ */

export function sessionHours(sessions: StudySession[]): number {
  return sessions.reduce((sum, s) => sum + (Number(s.duration) || 0), 0) / 60;
}

export function hoursOn(date: string, sessions: StudySession[]): number {
  return sessionHours(sessions.filter((s) => s.date.slice(0, 10) === date));
}

export function hoursThisMonth(sessions: StudySession[]): number {
  const month = todayISO().slice(0, 7);
  return sessionHours(sessions.filter((s) => s.date.slice(0, 7) === month));
}

export function hoursForSubject(name: string, sessions: StudySession[]): number {
  return sessionHours(sessions.filter((s) => s.subject === name));
}

/**
 * Consecutive days with any activity, counting back from today. A streak stays
 * alive if the user studied yesterday but hasn't opened the app today yet.
 */
export function computeStreak(activeDates: string[]): number {
  const days = new Set(activeDates.map((d) => d.slice(0, 10)));
  if (days.size === 0) return 0;

  let cursor = todayISO();
  if (!days.has(cursor)) {
    cursor = addDaysISO(cursor, -1);
    if (!days.has(cursor)) return 0;
  }

  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

export function activityDates(sessions: StudySession[], tests: TestRecord[]): string[] {
  return [...sessions.map((s) => s.date), ...tests.map((t) => t.date)].filter(Boolean);
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface WeekPoint {
  date: string;
  day: string;
  hours: number;
  target: number;
}

/** Last `days` days ending today, with hours aggregated per day. */
export function weekSeries(sessions: StudySession[], days = 7, target = readDailyTarget()): WeekPoint[] {
  const out: WeekPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDaysISO(todayISO(), -i);
    const [y, m, d] = date.split('-').map(Number);
    out.push({
      date,
      day: WEEKDAYS[new Date(y, m - 1, d).getDay()],
      hours: Math.round(hoursOn(date, sessions) * 10) / 10,
      target,
    });
  }
  return out;
}

export interface MonthPoint {
  key: string;
  month: string;
  hours: number;
}

/** Last `count` months including the current one. */
export function monthSeries(sessions: StudySession[], count = 4): MonthPoint[] {
  const out: MonthPoint[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}`;
    out.push({
      key,
      month: MONTHS[d.getMonth()],
      hours: Math.round(sessionHours(sessions.filter((s) => s.date.slice(0, 7) === key)) * 10) / 10,
    });
  }
  return out;
}

export interface HeatmapDay {
  date: string;
  hours: number;
}

export function heatmapSeries(sessions: StudySession[], days = 49): HeatmapDay[] {
  const out: HeatmapDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDaysISO(todayISO(), -i);
    out.push({ date, hours: Math.round(hoursOn(date, sessions) * 10) / 10 });
  }
  return out;
}

/** Progress from the chapter checklist when present, else the stored value. */
export function subjectProgress(subject: Subject): number {
  const done = subject.chapterDone;
  if (done && done.length > 0) {
    return Math.round((done.filter(Boolean).length / done.length) * 100);
  }
  return Math.max(0, Math.min(100, Number(subject.progress) || 0));
}

export function courseProgress(course: Course, subjects: Subject[]): number {
  const owned = subjects.filter((s) => s.courseId === course.id);
  if (owned.length === 0) return Math.max(0, Math.min(100, Number(course.progress) || 0));
  const avg = owned.reduce((sum, s) => sum + subjectProgress(s), 0) / owned.length;
  return Math.round(avg);
}

export function subjectCount(course: Course, subjects: Subject[]): number {
  const owned = subjects.filter((s) => s.courseId === course.id).length;
  return owned > 0 ? owned : course.subjects ?? 0;
}

/** Initial chapter checklist from the demo progress (first N chapters done). */
export function chapterChecklist(subject: Subject): boolean[] {
  if (subject.chapterDone && subject.chapterDone.length === subject.chapters) {
    return subject.chapterDone;
  }
  const total = Math.max(0, Math.floor(subject.chapters) || 0);
  const completed = Math.round((Math.max(0, Math.min(100, subject.progress)) / 100) * total);
  return Array.from({ length: total }, (_, i) => i < completed);
}
