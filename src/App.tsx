import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudyCenter from './pages/StudyCenter';
import StudyTimer from './pages/StudyTimer';
import CalendarPage from './pages/Calendar';
import Skills from './pages/Skills';
import Analytics from './pages/Analytics';
import Vault from './pages/Vault';
import Notes from './pages/Notes';
import SettingsPage from './pages/Settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

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
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
