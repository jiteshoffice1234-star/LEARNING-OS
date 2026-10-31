export const courses = [
  { id: '1', name: 'Computer Science', progress: 68, subjects: 5, color: '#8170ED' },
  { id: '2', name: 'Data Science & ML', progress: 42, subjects: 4, color: '#43B889' },
  { id: '3', name: 'Cloud Architecture', progress: 25, subjects: 3, color: '#E5AA55' },
  { id: '4', name: 'System Design', progress: 55, subjects: 3, color: '#E16F79' },
];

export const subjects = [
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

export const studySessions = [
  { id: '1', subject: 'Algorithms & Data Structures', date: '2026-10-31', duration: 120, type: 'deep' },
  { id: '2', subject: 'Machine Learning', date: '2026-10-31', duration: 90, type: 'deep' },
  { id: '3', subject: 'Operating Systems', date: '2026-10-30', duration: 60, type: 'revision' },
  { id: '4', subject: 'Database Systems', date: '2026-10-30', duration: 150, type: 'deep' },
  { id: '5', subject: 'Python Programming', date: '2026-10-29', duration: 180, type: 'deep' },
  { id: '6', subject: 'Computer Networks', date: '2026-10-29', duration: 45, type: 'revision' },
  { id: '7', subject: 'Deep Learning', date: '2026-10-28', duration: 100, type: 'deep' },
  { id: '8', subject: 'Software Engineering', date: '2026-10-28', duration: 75, type: 'revision' },
];

export const weeklyStudyData = [
  { day: 'Mon', hours: 4.5, target: 4 },
  { day: 'Tue', hours: 3.2, target: 4 },
  { day: 'Wed', hours: 5.8, target: 4 },
  { day: 'Thu', hours: 2.1, target: 4 },
  { day: 'Fri', hours: 4.0, target: 4 },
  { day: 'Sat', hours: 6.5, target: 4 },
  { day: 'Sun', hours: 3.8, target: 4 },
];

export const monthlyStudyData = [
  { week: 'W1', hours: 28 },
  { week: 'W2', hours: 32 },
  { week: 'W3', hours: 25 },
  { week: 'W4', hours: 30 },
];

export const skills = [
  { id: '1', name: 'Python', category: 'Programming', level: 4, targetLevel: 5, hours: 320, startDate: '2024-01', status: 'learning' },
  { id: '2', name: 'JavaScript/TypeScript', category: 'Programming', level: 4, targetLevel: 5, hours: 280, startDate: '2023-06', status: 'learning' },
  { id: '3', name: 'Machine Learning', category: 'Data Science', level: 2, targetLevel: 4, hours: 120, startDate: '2025-03', status: 'learning' },
  { id: '4', name: 'SQL & Databases', category: 'Data Science', level: 3, targetLevel: 4, hours: 200, startDate: '2024-06', status: 'learning' },
  { id: '5', name: 'System Design', category: 'Architecture', level: 2, targetLevel: 4, hours: 80, startDate: '2025-08', status: 'learning' },
  { id: '6', name: 'Cloud (AWS)', category: 'Architecture', level: 3, targetLevel: 4, hours: 150, startDate: '2024-09', status: 'learning' },
  { id: '7', name: 'Docker & Kubernetes', category: 'DevOps', level: 3, targetLevel: 4, hours: 100, startDate: '2025-01', status: 'learning' },
  { id: '8', name: 'Rust', category: 'Programming', level: 1, targetLevel: 3, hours: 40, startDate: '2026-06', status: 'planned' },
];

export const skillCategories = ['Programming', 'Data Science', 'Architecture', 'DevOps', 'Design', 'Management'];

export const achievements = [
  { id: '1', title: 'AWS Solutions Architect', issuer: 'Amazon Web Services', date: '2025-03', category: 'Certification', verified: true },
  { id: '2', title: 'TensorFlow Developer Certificate', issuer: 'Google', date: '2025-06', category: 'Certification', verified: true },
  { id: '3', title: 'Kubernetes Application Developer', issuer: 'CNCF', date: '2025-09', category: 'Certification', verified: true },
  { id: '4', title: 'First Place - University Hackathon', issuer: 'University Tech Club', date: '2024-11', category: 'Achievement', verified: false },
  { id: '5', title: 'Open Source Contributor Badge', issuer: 'GitHub', date: '2025-01', category: 'Achievement', verified: true },
];

export const revisions = [
  { id: '1', subject: 'Algorithms & Data Structures', cycle: 2, dueDate: '2026-11-02', status: 'upcoming' },
  { id: '2', subject: 'Machine Learning', cycle: 1, dueDate: '2026-11-03', status: 'upcoming' },
  { id: '3', subject: 'Database Systems', cycle: 3, dueDate: '2026-11-01', status: 'overdue' },
  { id: '4', subject: 'Operating Systems', cycle: 1, dueDate: '2026-11-05', status: 'upcoming' },
  { id: '5', subject: 'Python Programming', cycle: 4, dueDate: '2026-10-28', status: 'completed' },
];

export const tests = [
  { id: '1', name: 'Algorithms Mock Test 3', subject: 'Algorithms & Data Structures', maxMarks: 100, obtained: 82, date: '2026-10-25', accuracy: 82 },
  { id: '2', name: 'ML Fundamentals Quiz', subject: 'Machine Learning', maxMarks: 50, obtained: 38, date: '2026-10-22', accuracy: 76 },
  { id: '3', name: 'SQL Advanced Test', subject: 'Database Systems', maxMarks: 80, obtained: 72, date: '2026-10-20', accuracy: 90 },
  { id: '4', name: 'Network Protocols Test', subject: 'Computer Networks', maxMarks: 60, obtained: 45, date: '2026-10-18', accuracy: 75 },
  { id: '5', name: 'OS Concepts Exam', subject: 'Operating Systems', maxMarks: 100, obtained: 78, date: '2026-10-15', accuracy: 78 },
];

export const heatmapData = (() => {
  const data: { date: string; hours: number }[] = [];
  const start = new Date('2026-07-01');
  for (let i = 0; i < 120; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const hours = Math.random() > 0.15 ? Math.round(Math.random() * 6 * 10) / 10 : 0;
    data.push({ date: d.toISOString().split('T')[0], hours });
  }
  return data;
})();

export const calendarEvents = [
  { id: '1', title: 'Algorithm Revision', date: '2026-11-02', type: 'revision', color: '#8170ED' },
  { id: '2', title: 'ML Quiz', date: '2026-11-05', type: 'exam', color: '#E16F79' },
  { id: '3', title: 'Project Deadline', date: '2026-11-08', type: 'milestone', color: '#E5AA55' },
  { id: '4', title: 'DB Revision', date: '2026-11-03', type: 'revision', color: '#8170ED' },
  { id: '5', title: 'Study Group', date: '2026-11-04', type: 'event', color: '#43B889' },
];

export const roadmapItems = [
  { id: '1', skill: 'Machine Learning', milestone: 'Complete Andrew Ng Course', targetDate: '2026-12-01', progress: 60, status: 'on-track' },
  { id: '2', skill: 'Machine Learning', milestone: 'Build 3 ML Projects', targetDate: '2027-02-01', progress: 33, status: 'on-track' },
  { id: '3', skill: 'System Design', milestone: 'Read Designing Data-Intensive Apps', targetDate: '2026-11-15', progress: 75, status: 'on-track' },
  { id: '4', skill: 'System Design', milestone: 'Complete Grokking System Design', targetDate: '2026-12-31', progress: 45, status: 'delayed' },
  { id: '5', skill: 'Rust', milestone: 'Complete Rust Book', targetDate: '2027-03-01', progress: 20, status: 'on-track' },
];

export const qualifications = [
  { id: '1', name: 'B.Tech Computer Science', institution: 'IIT Delhi', status: 'completed', year: '2022-2026', grade: '8.5 CGPA' },
  { id: '2', name: 'AWS Solutions Architect', institution: 'Amazon', status: 'completed', year: '2025', grade: 'Passed' },
  { id: '3', name: 'TensorFlow Developer', institution: 'Google', status: 'completed', year: '2025', grade: 'Passed' },
  { id: '4', name: 'CFA Level 1', institution: 'CFA Institute', status: 'pursuing', year: '2026', grade: '-' },
];

export const notes = [
  { id: '1', title: 'Dynamic Programming Patterns', subject: 'Algorithms', date: '2026-10-30', tags: ['algorithms', 'dp'] },
  { id: '2', title: 'Neural Network Backpropagation', subject: 'Machine Learning', date: '2026-10-28', tags: ['ml', 'deep-learning'] },
  { id: '3', title: 'SQL Window Functions', subject: 'Database Systems', date: '2026-10-25', tags: ['sql', 'database'] },
  { id: '4', title: 'TCP/IP Protocol Stack', subject: 'Computer Networks', date: '2026-10-22', tags: ['networks', 'protocols'] },
  { id: '5', title: 'Process Scheduling Algorithms', subject: 'Operating Systems', date: '2026-10-20', tags: ['os', 'scheduling'] },
];

export const subjectDistribution = [
  { name: 'Algorithms', value: 28, color: '#8170ED' },
  { name: 'Machine Learning', value: 22, color: '#43B889' },
  { name: 'Database Systems', value: 18, color: '#E5AA55' },
  { name: 'Computer Networks', value: 12, color: '#E16F79' },
  { name: 'Operating Systems', value: 10, color: '#A99BFF' },
  { name: 'Software Engineering', value: 10, color: '#6EE7B7' },
];

export const performanceTrend = [
  { month: 'May', score: 65 },
  { month: 'Jun', score: 70 },
  { month: 'Jul', score: 68 },
  { month: 'Aug', score: 75 },
  { month: 'Sep', score: 78 },
  { month: 'Oct', score: 82 },
];
