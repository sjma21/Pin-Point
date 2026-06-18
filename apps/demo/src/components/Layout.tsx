import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import TableOfContents from './TableOfContents';
import { useTheme } from './ThemeContext';
import PinpointLogo from './PinpointLogo';

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
  const { theme, toggle } = useTheme();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="docs-layout">
      <header className="docs-topbar">
        <button
          className="docs-topbar-menu"
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
          aria-label="Toggle navigation"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>
        <span className="docs-topbar-logo"><PinpointLogo size={20} /> Pinpoint Docs</span>
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span className="theme-toggle-track">
            <span className="theme-toggle-thumb">
              {theme === 'dark' ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              )}
            </span>
          </span>
        </button>
        <Link to="/" className="docs-topbar-home">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to site
        </Link>
      </header>

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
