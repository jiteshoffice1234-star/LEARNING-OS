import { useState } from 'react';
import { usePersistentState, isDataWiped } from '../lib/storage';
import Modal, { ModalActions } from '../components/Modal';
import { todayISO } from '../lib/dates';
import { 
  FileText, Plus, TrendingUp, Target, Clock, Award, 
  ChevronRight, AlertCircle, CheckCircle2, XCircle, BarChart3, Trash2
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

const initialTests: Test[] = [
  { id: '1', name: 'Algorithms Mock Test 3', subject: 'Algorithms', maxMarks: 100, obtained: 82, date: '2026-10-25', totalQuestions: 50, correct: 41, incorrect: 5, unanswered: 4, timeTaken: 120, negativeMarking: true, type: 'mock' },
  { id: '2', name: 'ML Fundamentals Quiz', subject: 'Machine Learning', maxMarks: 50, obtained: 38, date: '2026-10-22', totalQuestions: 25, correct: 19, incorrect: 4, unanswered: 2, timeTaken: 45, negativeMarking: false, type: 'subject' },
  { id: '3', name: 'SQL Advanced Test', subject: 'Database Systems', maxMarks: 80, obtained: 72, date: '2026-10-20', totalQuestions: 40, correct: 36, incorrect: 2, unanswered: 2, timeTaken: 90, negativeMarking: true, type: 'mock' },
  { id: '4', name: 'Network Protocols Test', subject: 'Computer Networks', maxMarks: 60, obtained: 45, date: '2026-10-18', totalQuestions: 30, correct: 22, incorrect: 5, unanswered: 3, timeTaken: 60, negativeMarking: true, type: 'subject' },
  { id: '5', name: 'OS Concepts Exam', subject: 'Operating Systems', maxMarks: 100, obtained: 78, date: '2026-10-15', totalQuestions: 50, correct: 39, incorrect: 7, unanswered: 4, timeTaken: 120, negativeMarking: true, type: 'mock' },
  { id: '6', name: 'DP Chapter Test', subject: 'Algorithms', maxMarks: 30, obtained: 24, date: '2026-10-12', totalQuestions: 15, correct: 12, incorrect: 2, unanswered: 1, timeTaken: 30, negativeMarking: false, type: 'chapter' },
];

export default function TestsCenter() {
  const wiped = isDataWiped();
  const [tests, setTests] = usePersistentState<Test[]>('tests', wiped ? [] : initialTests);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [filter, setFilter] = useState<'all' | 'mock' | 'subject' | 'chapter'>('all');

  // --- Log Test form state ---
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState<Test['type']>('mock');
  const [date, setDate] = useState(todayISO());
  const [maxMarks, setMaxMarks] = useState('100');
  const [obtained, setObtained] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('');
  const [correct, setCorrect] = useState('');
  const [incorrect, setIncorrect] = useState('');
  const [timeTaken, setTimeTaken] = useState('');
  const [negativeMarking, setNegativeMarking] = useState(true);

  const filtered = filter === 'all' ? tests : tests.filter(t => t.type === filter);
  
  const avgAccuracy = tests.length
    ? Math.round(tests.reduce((acc, t) => acc + (t.correct / t.totalQuestions * 100), 0) / tests.length)
    : 0;
  const totalTests = tests.length;
  const bestScore = tests.length ? Math.max(...tests.map(t => (t.obtained / t.maxMarks) * 100)) : 0;

  // Derive the performance trend from real tests, oldest → newest.
  const performanceData = [...tests]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t, i) => ({ test: `T${i + 1}`, score: Math.round((t.obtained / t.maxMarks) * 100) }));

  const resetForm = () => {
    setName('');
    setSubject('');
    setType('mock');
    setDate(todayISO());
    setMaxMarks('100');
    setObtained('');
    setTotalQuestions('');
    setCorrect('');
    setIncorrect('');
    setTimeTaken('');
    setNegativeMarking(true);
  };

  const handleLogTest = () => {
    if (!name.trim()) return;
    const total = Math.max(0, Number(totalQuestions) || 0);
    const correctCount = Math.min(Math.max(0, Number(correct) || 0), total);
    const incorrectCount = Math.min(Math.max(0, Number(incorrect) || 0), total - correctCount);

    const test: Test = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      subject: subject.trim() || 'General',
      maxMarks: Math.max(1, Number(maxMarks) || 100),
      obtained: Math.max(0, Number(obtained) || 0),
      date: date || todayISO(),
      totalQuestions: total || 1,
      correct: correctCount,
      incorrect: incorrectCount,
      unanswered: Math.max(0, total - correctCount - incorrectCount),
      timeTaken: Math.max(0, Number(timeTaken) || 0),
      negativeMarking,
      type,
    };
    setTests([...tests, test]);
    resetForm();
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setTests(tests.filter((t) => t.id !== id));
    if (selectedTest?.id === id) setSelectedTest(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Tests & Examinations</h1>
          <p className="text-sm text-muted mt-1">Track your test performance and identify weak areas</p>
        </div>
        <button type="button" 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
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
          <p className="text-2xl font-bold text-accent">
            {performanceData.length >= 2
              ? `${performanceData[performanceData.length - 1].score - performanceData[0].score >= 0 ? '+' : ''}${performanceData[performanceData.length - 1].score - performanceData[0].score}%`
              : '—'}
          </p>
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
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(test.id); }}
                  aria-label={`Delete test: ${test.name}`}
                  className="p-1 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
              <button type="button" onClick={() => setSelectedTest(null)} className="p-1.5 rounded-lg hover:bg-elevated text-muted">✕</button>
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

      {/* Log Test dialog */}
      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); resetForm(); }}
        title="Log Test"
        description="Record a new test result to track your performance."
        footer={
          <ModalActions
            onCancel={() => { setShowAdd(false); resetForm(); }}
            onSubmit={handleLogTest}
            submitLabel="Log Test"
            submitDisabled={!name.trim() || !subject.trim()}
          />
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Test Name *</label>
            <input
              type="text"
              placeholder="e.g. Algorithms Mock Test 3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Subject *</label>
            <input
              type="text"
              placeholder="e.g. Machine Learning"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Type</label>
            <div className="flex gap-2">
              {(['mock', 'subject', 'chapter'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                    type === t ? 'bg-primary text-white' : 'bg-elevated text-text hover:bg-elevated/80 border border-border/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Max Marks</label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Obtained</label>
            <input
              type="number"
              value={obtained}
              onChange={(e) => setObtained(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Total Questions</label>
            <input
              type="number"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Correct</label>
            <input
              type="number"
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Incorrect</label>
            <input
              type="number"
              value={incorrect}
              onChange={(e) => setIncorrect(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Time Taken (min)</label>
            <input
              type="number"
              value={timeTaken}
              onChange={(e) => setTimeTaken(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Negative Marking</label>
          <button
            type="button"
            onClick={() => setNegativeMarking(!negativeMarking)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              negativeMarking
                ? 'bg-success/15 text-success border border-success/30'
                : 'bg-elevated text-muted border border-border'
            }`}
          >
            {negativeMarking ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            <span>{negativeMarking ? 'On' : 'Off'}</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}
