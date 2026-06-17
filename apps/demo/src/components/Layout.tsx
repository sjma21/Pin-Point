import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TableOfContents from './TableOfContents';

interface TocItem {
  id: string;
  label: string;
  depth?: number;
}

interface LayoutProps {
  children: React.ReactNode;
  toc?: TocItem[];
}

export default function Layout({ children, toc }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="docs-layout">
      <button
        className="mobile-nav-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <main className="docs-main">
        <div className="docs-content">{children}</div>
        {toc && toc.length > 0 && (
          <TableOfContents items={toc} />
        )}
      </main>
    </div>
  );
}
