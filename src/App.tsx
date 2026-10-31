import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import CommandPalette from './components/CommandPalette';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import StudyCenter from './pages/StudyCenter';
import StudyTimer from './pages/StudyTimer';
import CalendarPage from './pages/Calendar';
import Skills from './pages/Skills';
import Analytics from './pages/Analytics';
import Vault from './pages/Vault';
import Notes from './pages/Notes';
import SettingsPage from './pages/Settings';
import RevisionManager from './pages/RevisionManager';
import TestsCenter from './pages/TestsCenter';
import Roadmap from './pages/Roadmap';
import Qualifications from './pages/Qualifications';
import Profile from './pages/Profile';
import BackupCenter from './pages/BackupCenter';
import InboxPage from './pages/Inbox';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Flashcards from './pages/Flashcards';
import Knowledge from './pages/Knowledge';
import Goals from './pages/Goals';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

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

  if (showWelcome) {
    return <Welcome onComplete={() => setShowWelcome(false)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      // Home
      case 'dashboard': return <Dashboard />;
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
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setCurrentPage}
      />
    </>
  );
}
