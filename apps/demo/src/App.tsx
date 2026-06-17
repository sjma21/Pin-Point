import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './landing/Landing';
import DemoApp from './demo/DemoApp';
// Docs pages (accessible via sidebar from /docs/*)
import DocsHome from './pages/Home';
import Install from './pages/Install';
import Features from './pages/Features';
import Output from './pages/Output';
import Schema from './pages/Schema';
import Mcp from './pages/Mcp';
import Api from './pages/Api';
import Changelog from './pages/Changelog';
import Faq from './pages/Faq';

export default function App() {
  return (
    <Routes>
      {/* Marketing landing page */}
      <Route path="/" element={<Landing />} />

      {/* Interactive demo — Pinpoint toolbar embedded inside DemoApp */}
      <Route path="/demo" element={<DemoApp />} />

      {/* Documentation */}
      <Route path="/docs" element={<DocsHome />} />
      <Route path="/install" element={<Install />} />
      <Route path="/features" element={<Features />} />
      <Route path="/output" element={<Output />} />
      <Route path="/schema" element={<Schema />} />
      <Route path="/mcp" element={<Mcp />} />
      <Route path="/api" element={<Api />} />
      <Route path="/changelog" element={<Changelog />} />
      <Route path="/faq" element={<Faq />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
