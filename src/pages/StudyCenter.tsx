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
    <div className="p-3 md:p-4 lg:p-5 pb-20 md:pb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text">Study Center</h1>
          <p className="text-xs text-muted">Courses · Subjects · Chapters</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-3.5 h-3.5" />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {courses.map((course) => (
            <div 
              key={course.id} 
              onClick={() => setSelectedCourse(course.id)}
              className="glass-card rounded-lg p-3 cursor-pointer hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${course.color}20` }}>
                  <BookOpen className="w-4 h-4" style={{ color: course.color }} />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <div className="rounded-lg border border-dashed border-border hover:border-primary/40 p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors min-h-[100px]">
            <Plus className="w-4 h-4 text-muted" />
            <span className="text-[10px] text-muted">Add Course</span>
          </div>
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
