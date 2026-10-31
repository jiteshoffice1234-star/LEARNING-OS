import { useState } from 'react';
import { 
  BookOpen, ChevronRight, Clock, CheckCircle2, 
  Plus, MoreHorizontal, FolderOpen, FileText
} from 'lucide-react';
import { courses, subjects } from '../data/mockData';

export default function StudyCenter() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredSubjects = selectedCourse 
    ? subjects.filter(s => s.courseId === selectedCourse)
    : subjects;

  const currentCourse = courses.find(c => c.id === selectedCourse);

  if (selectedSubject) {
    const subject = subjects.find(s => s.id === selectedSubject);
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
              <button className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors">
                Start Session
              </button>
              <button className="p-2 rounded-lg hover:bg-elevated text-muted transition-colors">
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
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-elevated/30 hover:bg-elevated/50 transition-colors cursor-pointer group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isComplete ? 'bg-success/15' : 'bg-primary/15'
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <span className="text-xs font-medium text-primary">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text">Chapter {i + 1}: {getChapterName(i)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-elevated rounded-full overflow-hidden max-w-32">
                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-muted">{Math.min(progress, 100)}%</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Study Center</h1>
          <p className="text-sm text-muted mt-1">Manage your courses, subjects and chapters</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Course</span>
        </button>
      </div>

      {/* Breadcrumb */}
      {selectedCourse && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button onClick={() => setSelectedCourse(null)} className="text-muted hover:text-text transition-colors">
            All Courses
          </button>
          <ChevronRight className="w-3 h-3 text-muted" />
          <span className="text-text font-medium">{currentCourse?.name}</span>
        </div>
      )}

      {/* Course Grid or Subject List */}
      {!selectedCourse ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {courses.map((course) => (
            <div 
              key={course.id} 
              onClick={() => setSelectedCourse(course.id)}
              className="glass-card rounded-xl p-5 cursor-pointer hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${course.color}20` }}>
                  <BookOpen className="w-5 h-5" style={{ color: course.color }} />
                </div>
                <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-sm font-semibold text-text mb-1">{course.name}</h3>
              <p className="text-xs text-muted mb-3">{course.subjects} subjects</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted">Progress</span>
                <span className="text-xs font-medium text-text">{course.progress}%</span>
              </div>
              <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${course.progress}%`, backgroundColor: course.color }} />
              </div>
            </div>
          ))}
          
          {/* Add Course Card */}
          <div className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors min-h-[160px]">
            <Plus className="w-6 h-6 text-muted" />
            <span className="text-xs text-muted">Add Course</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubjects.map((subject) => (
            <div 
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className="glass-card rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-all group flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text">{subject.name}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {subject.chapters} chapters
                  </span>
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {subject.hours}h
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="hidden sm:block w-24">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted">{subject.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${subject.progress}%` }} />
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getChapterName(index: number): string {
  const names = [
    'Introduction & Fundamentals',
    'Core Concepts',
    'Advanced Techniques',
    'Problem Solving',
    'Implementation',
    'Optimization',
    'Real-world Applications',
    'Case Studies',
    'Best Practices',
    'Review & Practice',
    'Mock Tests',
    'Final Revision',
    'Interview Preparation',
    'Project Work',
    'Advanced Topics',
  ];
  return names[index % names.length];
}
