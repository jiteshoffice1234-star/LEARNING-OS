import { useState } from 'react';
import { usePersistentState, isDataWiped } from '../lib/storage';
import Modal, { ModalActions } from '../components/Modal';
import {
  BookOpen, ChevronRight, Clock, CheckCircle2,
  Plus, MoreHorizontal, FolderOpen, FileText, Timer, Trash2, Play
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  color: string;
  progress: number;
  subjects: number;
}

interface Subject {
  id: string;
  courseId: string;
  name: string;
  progress: number;
  chapters: number;
  hours: number;
}

const courseColors = ['#8170ED', '#43B889', '#E5AA55', '#E16F79', '#A99BFF', '#6EE7B7'];

const initialCourses: Course[] = [
  { id: '1', name: 'Computer Science', progress: 68, subjects: 5, color: '#8170ED' },
  { id: '2', name: 'Data Science & ML', progress: 42, subjects: 4, color: '#43B889' },
  { id: '3', name: 'Cloud Architecture', progress: 25, subjects: 3, color: '#E5AA55' },
  { id: '4', name: 'System Design', progress: 55, subjects: 3, color: '#E16F79' },
];

const initialSubjects: Subject[] = [
  { id: '1', courseId: '1', name: 'Algorithms & Data Structures', progress: 72, chapters: 12, hours: 48 },
  { id: '2', courseId: '1', name: 'Operating Systems', progress: 58, chapters: 8, hours: 32 },
  { id: '3', courseId: '1', name: 'Database Systems', progress: 81, chapters: 10, hours: 36 },
  { id: '4', courseId: '1', name: 'Computer Networks', progress: 45, chapters: 9, hours: 28 },
  { id: '5', courseId: '1', name: 'Software Engineering', progress: 63, chapters: 7, hours: 24 },
  { id: '6', courseId: '2', name: 'Python Programming', progress: 85, chapters: 15, hours: 60 },
  { id: '7', courseId: '2', name: 'Machine Learning', progress: 38, chapters: 12, hours: 42 },
  { id: '8', courseId: '2', name: 'Deep Learning', progress: 22, chapters: 8, hours: 20 },
  { id: '9', courseId: '2', name: 'Data Visualization', progress: 65, chapters: 6, hours: 18 },
];

export default function StudyCenter() {
  const wiped = isDataWiped();
  const [courses, setCourses] = usePersistentState<Course[]>('courses', wiped ? [] : initialCourses);
  const [subjects, setSubjects] = usePersistentState<Subject[]>('subjects', wiped ? [] : initialSubjects);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredSubjects = selectedCourse
    ? subjects.filter((s) => s.courseId === selectedCourse)
    : subjects;

  const currentCourse = courses.find((c) => c.id === selectedCourse);

  const colorFor = (name: string) => courseColors[name.length % courseColors.length];

  // --- New Course form ---
  const [showAdd, setShowAdd] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseSubjects, setNewCourseSubjects] = useState('3');

  const resetCourseForm = () => {
    setNewCourseName('');
    setNewCourseSubjects('3');
  };

  const handleAddCourse = () => {
    if (!newCourseName.trim()) return;
    const course: Course = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: newCourseName.trim(),
      color: colorFor(newCourseName),
      progress: 0,
      subjects: Math.max(1, Number(newCourseSubjects) || 1),
    };
    setCourses([...courses, course]);
    resetCourseForm();
    setShowAdd(false);
  };

  const handleDeleteCourse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCourses(courses.filter((c) => c.id !== id));
    setSubjects(subjects.filter((s) => s.courseId !== id));
    if (selectedCourse === id) setSelectedCourse(null);
  };

  // --- Start Session ---
  const [showSession, setShowSession] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState('50');

  const handleStartSession = (subjectId: string) => {
    setSessionMinutes('50');
    setSelectedSubject(subjectId);
    setShowSession(true);
  };

  const handleLogSession = () => {
    const mins = Math.max(0, Number(sessionMinutes) || 0);
    setShowSession(false);
    setSessionMinutes('50');
  };

  // Subject detail view
  if (selectedSubject) {
    const subject = subjects.find((s) => s.id === selectedSubject);

    return (
      <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        <button
          onClick={() => setSelectedSubject(null)}
          className="flex items-center gap-1 text-sm text-muted hover:text-text mb-4 transition-colors"
        >
          ← Back to subjects
        </button>
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-text">{subject?.name}</h2>
              <p className="text-sm text-muted mt-1">{subject?.chapters} chapters • {subject?.hours}h studied</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartSession(selectedSubject!)}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Play className="w-3 h-3 mr-1" /> Start Session
              </button>
              <button type="button" className="p-2 rounded-lg hover:bg-elevated text-muted transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Overall Progress</span>
              <span className="text-sm font-medium text-text">{subject?.progress}%</span>
            </div>
            <div className="h-2 bg-elevated rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${subject?.progress}%` }} />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-text mb-3">Chapters</h3>
          <div className="space-y-2">
            {Array.from({ length: subject?.chapters || 0 }, (_, i) => {
              const progress = Math.max(0, Math.min(100, (subject?.progress || 0) + (i * 5 - 20)));
              const isComplete = progress >= 100;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    // Placeholder: chapter detail could be expanded later
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30 hover:bg-elevated/50 transition-colors group w-full"
                >
                  <div className={`${isComplete ? 'bg-success/15' : 'bg-primary/15'} w-8 h-8 rounded-lg flex items-center justify-center`}>
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <span className="text-xs font-medium text-primary">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text">Chapter {i + 1}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-elevated rounded-full overflow-hidden max-w-32">
                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-muted">{Math.min(progress, 100)}%</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Session dialog */}
        <Modal
          open={showSession}
          onClose={() => setShowSession(false)}
          title="Start Study Session"
          description={`Focused session for ${subject?.name}`}
          footer={
            <ModalActions
              onCancel={() => setShowSession(false)}
              onSubmit={handleLogSession}
              submitLabel="Log Session"
              submitDisabled={sessionMinutes.trim() === '' || Number(sessionMinutes) <= 0}
            />
          }
        >
          <div>
            <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Duration (minutes)</label>
            <input
              type="number"
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(e.target.value)}
              className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>
          <p className="text-[11px] text-muted">This records a completed study block. It does not start a live timer — use the Timer page for a live countdown.</p>
        </Modal>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text">Study Center</h1>
          <p className="text-xs text-muted">Courses · Subjects · Chapters</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Course</span>
        </button>
      </div>

      {/* Breadcrumb */}
      {selectedCourse && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button type="button" onClick={() => setSelectedCourse(null)} className="text-muted hover:text-text transition-colors">
            All Courses
          </button>
          <ChevronRight className="w-3 h-3 text-muted" />
          <span className="text-text font-medium">{currentCourse?.name}</span>
        </div>
      )}

      {/* Course Grid or Subject List */}
      {!selectedCourse ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course.id)}
              className="glass-card rounded-lg p-3 cursor-pointer hover:border-primary/30 transition-all group relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${course.color}20` }}>
                  <BookOpen className="w-4 h-4" style={{ color: course.color }} />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  type="button"
                  onClick={(e) => handleDeleteCourse(course.id, e)}
                  aria-label={`Delete course: ${course.name}`}
                  className="absolute -top-1 -right-1 p-1 rounded text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <h3 className="text-xs font-semibold text-text mb-0.5 line-clamp-1">{course.name}</h3>
              <p className="text-[10px] text-muted mb-2">{course.subjects} subjects</p>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted">{course.progress}%</span>
              </div>
              <div className="h-1 bg-elevated rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${course.progress}%`, backgroundColor: course.color }} />
              </div>
            </div>
          ))}

          {/* Add Course Card */}
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="rounded-lg border border-dashed border-border hover:border-primary/40 p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors min-h-[100px]"
          >
            <Plus className="w-4 h-4 text-muted" />
            <span className="text-[10px] text-muted">Add Course</span>
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className="glass-card rounded-lg p-2.5 cursor-pointer hover:border-primary/30 transition-all group flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0">
                <FolderOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-text">{subject.name}</h3>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[11px] text-muted">{subject.chapters}ch · {subject.hours}h</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-20 h-1 bg-elevated rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${subject.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-muted w-7 text-right">{subject.progress}%</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Course dialog */}
      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); resetCourseForm(); }}
        title="New Course"
        description="Add a course to track your progress across its subjects."
        footer={
          <ModalActions
            onCancel={() => { setShowAdd(false); resetCourseForm(); }}
            onSubmit={handleAddCourse}
            submitLabel="Create Course"
            submitDisabled={!newCourseName.trim()}
          />
        }
      >
        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Course Name *</label>
          <input
            type="text"
            placeholder="e.g. Computer Science"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary"
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Number of Subjects</label>
          <input
            type="number"
            min="1"
            value={newCourseSubjects}
            onChange={(e) => setNewCourseSubjects(e.target.value)}
            className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
          />
          <p className="text-[11px] text-muted mt-1">You can add subjects later from any course page.</p>
        </div>
      </Modal>
    </div>
  );
}
