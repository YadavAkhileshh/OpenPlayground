import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BlockchainProvider } from './context/BlockchainContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import BlockDetails from './pages/BlockDetails';
import TxDetails from './pages/TxDetails';
import AddressDetails from './pages/AddressDetails';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <BlockchainProvider>
        <BrowserRouter>
          <Header />
          <main style={{ minHeight: 'calc(100vh - 64px)' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/block/:id" element={<BlockDetails />} />
              <Route path="/tx/:hash" element={<TxDetails />} />
              <Route path="/address/:address" element={<AddressDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer style={{
            borderTop: '1px solid var(--border-color)',
            padding: '20px 0',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
          }}>
            <div className="app-container">
              <p>© 2026 BlockPulse Explorer — Built with React & Web3.js</p>
              <p style={{ marginTop: 4, opacity: 0.6 }}>
                Educational blockchain explorer for learning and exploration
              </p>
            </div>
          </footer>
        </BrowserRouter>
      </BlockchainProvider>
    </ThemeProvider>
  );
}

export default App;
