import { useState, useEffect, Suspense, lazy } from 'react';
import Layout from './components/Layout';
import CommandPalette from './components/CommandPalette';
import Dashboard from './pages/Dashboard';
import { initTheme } from './lib/theme';

// Everything except the landing page loads on demand. This keeps the initial
// bundle small (recharts alone is ~400 kB) while the dashboard renders instantly.
const InboxPage = lazy(() => import('./pages/Inbox'));
const StudyCenter = lazy(() => import('./pages/StudyCenter'));
const StudyTimer = lazy(() => import('./pages/StudyTimer'));
const CalendarPage = lazy(() => import('./pages/Calendar'));
const Skills = lazy(() => import('./pages/Skills'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Vault = lazy(() => import('./pages/Vault'));
const Notes = lazy(() => import('./pages/Notes'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const RevisionManager = lazy(() => import('./pages/RevisionManager'));
const TestsCenter = lazy(() => import('./pages/TestsCenter'));
const Roadmap = lazy(() => import('./pages/Roadmap'));
const Qualifications = lazy(() => import('./pages/Qualifications'));
const Profile = lazy(() => import('./pages/Profile'));
const BackupCenter = lazy(() => import('./pages/BackupCenter'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Projects = lazy(() => import('./pages/Projects'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const Knowledge = lazy(() => import('./pages/Knowledge'));
const Goals = lazy(() => import('./pages/Goals'));

/** Lightweight spinner shown while a route chunk downloads. */
function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading page">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Apply the persisted theme as early as possible.
  useEffect(() => {
    initTheme();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      // Home
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'inbox': return <InboxPage />;
      // Learn
      case 'study': return <StudyCenter />;
      case 'timer': return <StudyTimer />;
      case 'calendar': return <CalendarPage />;
      case 'revisions': return <RevisionManager />;
      case 'tests': return <TestsCenter />;
      case 'flashcards': return <Flashcards />;
      // Build
      case 'tasks': return <Tasks />;
      case 'projects': return <Projects />;
      // Plan
      case 'roadmap': return <Roadmap />;
      case 'goals': return <Goals />;
      // Remember
      case 'knowledge': return <Knowledge />;
      case 'skills': return <Skills />;
      case 'vault': return <Vault />;
      case 'notes': return <Notes />;
      // Measure
      case 'analytics': return <Analytics />;
      case 'qualifications': return <Qualifications />;
      // System
      case 'profile': return <Profile />;
      case 'backup': return <BackupCenter />;
      case 'settings': return <SettingsPage onNavigate={setCurrentPage} />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        <Suspense fallback={<PageLoading />}>{renderPage()}</Suspense>
      </Layout>
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setCurrentPage}
      />
    </>
  );
}
