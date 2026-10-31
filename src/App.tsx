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

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false); // Set to true for first-time onboarding demo

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K = Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      // Escape = Close palette
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
      case 'dashboard': return <Dashboard />;
      case 'study': return <StudyCenter />;
      case 'timer': return <StudyTimer />;
      case 'calendar': return <CalendarPage />;
      case 'skills': return <Skills />;
      case 'analytics': return <Analytics />;
      case 'vault': return <Vault />;
      case 'notes': return <Notes />;
      case 'settings': return <SettingsPage />;
      case 'revisions': return <RevisionManager />;
      case 'tests': return <TestsCenter />;
      case 'roadmap': return <Roadmap />;
      case 'qualifications': return <Qualifications />;
      case 'profile': return <Profile />;
      case 'backup': return <BackupCenter />;
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
