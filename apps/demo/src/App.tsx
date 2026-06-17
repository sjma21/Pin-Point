import { Routes, Route } from 'react-router-dom';
import { Pinpoint } from '@pinpoint/toolbar';
import Home from './pages/Home';
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
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/install" element={<Install />} />
        <Route path="/features" element={<Features />} />
        <Route path="/output" element={<Output />} />
        <Route path="/schema" element={<Schema />} />
        <Route path="/mcp" element={<Mcp />} />
        <Route path="/api" element={<Api />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/faq" element={<Faq />} />
      </Routes>

      <Pinpoint endpoint="http://localhost:4747" />
    </>
  );
}
