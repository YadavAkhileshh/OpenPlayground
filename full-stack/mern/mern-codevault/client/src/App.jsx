import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu, Terminal } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Vault from './pages/Vault';
import Favorites from './pages/Favorites';
import Collections from './pages/Collections';
import Tags from './pages/Tags';
import Help from './pages/Help';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Sidebar />
        <main className="lg:ml-72 p-6 md:p-12">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between mb-8 glass p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Terminal className="text-primary" />
              <span className="font-bold">CodeVault</span>
            </div>
            <button className="p-2 glass rounded-lg">
              <Menu />
            </button>
          </header>

          <Routes>
            <Route path="/" element={<Vault />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
