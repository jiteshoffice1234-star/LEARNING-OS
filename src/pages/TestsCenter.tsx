import { useState } from 'react';
import { 
  FileText, Plus, TrendingUp, Target, Clock, Award, 
  ChevronRight, AlertCircle, CheckCircle2, XCircle, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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

const tests: Test[] = [
  { id: '1', name: 'Algorithms Mock Test 3', subject: 'Algorithms', maxMarks: 100, obtained: 82, date: '2026-10-25', totalQuestions: 50, correct: 41, incorrect: 5, unanswered: 4, timeTaken: 120, negativeMarking: true, type: 'mock' },
  { id: '2', name: 'ML Fundamentals Quiz', subject: 'Machine Learning', maxMarks: 50, obtained: 38, date: '2026-10-22', totalQuestions: 25, correct: 19, incorrect: 4, unanswered: 2, timeTaken: 45, negativeMarking: false, type: 'subject' },
  { id: '3', name: 'SQL Advanced Test', subject: 'Database Systems', maxMarks: 80, obtained: 72, date: '2026-10-20', totalQuestions: 40, correct: 36, incorrect: 2, unanswered: 2, timeTaken: 90, negativeMarking: true, type: 'mock' },
  { id: '4', name: 'Network Protocols Test', subject: 'Computer Networks', maxMarks: 60, obtained: 45, date: '2026-10-18', totalQuestions: 30, correct: 22, incorrect: 5, unanswered: 3, timeTaken: 60, negativeMarking: true, type: 'subject' },
  { id: '5', name: 'OS Concepts Exam', subject: 'Operating Systems', maxMarks: 100, obtained: 78, date: '2026-10-15', totalQuestions: 50, correct: 39, incorrect: 7, unanswered: 4, timeTaken: 120, negativeMarking: true, type: 'mock' },
  { id: '6', name: 'DP Chapter Test', subject: 'Algorithms', maxMarks: 30, obtained: 24, date: '2026-10-12', totalQuestions: 15, correct: 12, incorrect: 2, unanswered: 1, timeTaken: 30, negativeMarking: false, type: 'chapter' },
];

const performanceData = [
  { test: 'T1', score: 65 },
  { test: 'T2', score: 70 },
  { test: 'T3', score: 68 },
  { test: 'T4', score: 75 },
  { test: 'T5', score: 82 },
  { test: 'T6', score: 80 },
];

export default function TestsCenter() {
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [filter, setFilter] = useState<'all' | 'mock' | 'subject' | 'chapter'>('all');

  const filtered = filter === 'all' ? tests : tests.filter(t => t.type === filter);
  
  const avgAccuracy = Math.round(tests.reduce((acc, t) => acc + (t.correct / t.totalQuestions * 100), 0) / tests.length);
  const totalTests = tests.length;
  const bestScore = Math.max(...tests.map(t => (t.obtained / t.maxMarks) * 100));

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Tests & Examinations</h1>
          <p className="text-sm text-muted mt-1">Track your test performance and identify weak areas</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Log Test</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted">Total Tests</span>
          </div>
          <p className="text-2xl font-bold text-text">{totalTests}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-success" />
            <span className="text-xs text-muted">Avg Accuracy</span>
          </div>
          <p className="text-2xl font-bold text-success">{avgAccuracy}%</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted">Best Score</span>
          </div>
          <p className="text-2xl font-bold text-warning">{Math.round(bestScore)}%</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted">Improvement</span>
          </div>
          <p className="text-2xl font-bold text-accent">+17%</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="glass-card rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-text mb-4">Performance Trend</h3>
        <div className="h-48">
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

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', 'mock', 'subject', 'chapter'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary/15 text-primary' : 'bg-elevated/50 text-muted hover:text-text'
            }`}
          >
            {f === 'all' ? 'All Tests' : `${f} Tests`}
          </button>
        ))}
      </div>

      {/* Test List */}
      <div className="space-y-3">
        {filtered.map((test) => {
          const percentage = Math.round((test.obtained / test.maxMarks) * 100);
          const accuracy = Math.round((test.correct / test.totalQuestions) * 100);
          return (
            <div
              key={test.id}
              onClick={() => setSelectedTest(test)}
              className="glass-card rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                  percentage >= 80 ? 'bg-success/15' : percentage >= 60 ? 'bg-warning/15' : 'bg-danger/15'
                }`}>
                  <span className={`text-sm font-bold ${
                    percentage >= 80 ? 'text-success' : percentage >= 60 ? 'text-warning' : 'text-danger'
                  }`}>{percentage}%</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text truncate">{test.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      test.type === 'mock' ? 'bg-primary/15 text-primary' :
                      test.type === 'subject' ? 'bg-accent/15 text-accent' : 'bg-elevated text-muted'
                    }`}>
                      {test.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{test.subject}</span>
                    <span>{test.obtained}/{test.maxMarks}</span>
                    <span>{test.date}</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-muted">Accuracy</p>
                    <p className="text-sm font-medium text-text">{accuracy}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted">Time</p>
                    <p className="text-sm font-medium text-text">{test.timeTaken}m</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Test Detail Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedTest(null)} />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">{selectedTest.name}</h2>
              <button onClick={() => setSelectedTest(null)} className="p-1.5 rounded-lg hover:bg-elevated text-muted">✕</button>
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 rounded-lg bg-elevated/50">
                <p className="text-2xl font-bold text-primary">{Math.round((selectedTest.obtained / selectedTest.maxMarks) * 100)}%</p>
                <p className="text-[10px] text-muted">Score</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-elevated/50">
                <p className="text-2xl font-bold text-success">{Math.round((selectedTest.correct / selectedTest.totalQuestions) * 100)}%</p>
                <p className="text-[10px] text-muted">Accuracy</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-elevated/50">
                <p className="text-2xl font-bold text-text">{selectedTest.timeTaken}m</p>
                <p className="text-[10px] text-muted">Time</p>
              </div>
            </div>

            {/* Question Breakdown */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Question Breakdown</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm text-text flex-1">Correct</span>
                  <span className="text-sm font-medium text-success">{selectedTest.correct}</span>
                </div>
                <div className="flex items-center gap-3">
                  <XCircle className="w-4 h-4 text-danger" />
                  <span className="text-sm text-text flex-1">Incorrect</span>
                  <span className="text-sm font-medium text-danger">{selectedTest.incorrect}</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <span className="text-sm text-text flex-1">Unanswered</span>
                  <span className="text-sm font-medium text-warning">{selectedTest.unanswered}</span>
                </div>
              </div>
              {selectedTest.negativeMarking && (
                <div className="mt-3 p-2 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-xs text-warning">⚠ Negative marking applied (-0.25 per wrong answer)</p>
                </div>
              )}
            </div>

            {/* Mistake Categories */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Mistake Categories</h3>
              <div className="space-y-2">
                {[
                  { category: 'Conceptual Error', count: 2, color: 'text-danger' },
                  { category: 'Calculation Mistake', count: 1, color: 'text-warning' },
                  { category: 'Misread Question', count: 1, color: 'text-accent' },
                  { category: 'Time Pressure', count: 1, color: 'text-muted' },
                ].map((mistake) => (
                  <div key={mistake.category} className="flex items-center gap-3 p-2 rounded-lg bg-elevated/30">
                    <span className={`text-sm ${mistake.color}`}>{mistake.count}</span>
                    <span className="text-sm text-text flex-1">{mistake.category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted">Subject</p>
                <p className="text-text">{selectedTest.subject}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Date</p>
                <p className="text-text">{selectedTest.date}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Marks</p>
                <p className="text-text">{selectedTest.obtained} / {selectedTest.maxMarks}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Total Questions</p>
                <p className="text-text">{selectedTest.totalQuestions}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
