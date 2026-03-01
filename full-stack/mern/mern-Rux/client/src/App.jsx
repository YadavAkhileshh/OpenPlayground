import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import SystemHealth from './pages/SystemHealth';
import CommandCore from './pages/CommandCore';
import KnowledgeGraph from './pages/KnowledgeGraph';
import SecurityVault from './pages/SecurityVault';
import Analytics from './pages/Analytics';

// Components
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';

const App = () => {
  return (
    <Router>
      <div className="nexus-layout" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', position: 'relative' }}>
          <TopHeader />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<SystemHealth />} />
              <Route path="/terminal" element={<CommandCore />} />
              <Route path="/graph" element={<KnowledgeGraph />} />
              <Route path="/vault" element={<SecurityVault />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
};

export default App;
