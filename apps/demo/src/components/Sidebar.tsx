import { NavLink, Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import PinpointLogo from './PinpointLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navSections = [
  {
    label: 'Getting Started',
    links: [
      { to: '/docs', label: 'Overview' },
      { to: '/install', label: 'Installation' },
    ],
  },
  {
    label: 'Tools',
    links: [
      { to: '/mcp', label: 'MCP Server' },
      { to: '/api', label: 'REST API' },
    ],
  },
  {
    label: 'Reference',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/output', label: 'Output Formats' },
      { to: '/schema', label: 'Schema' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { to: '/changelog', label: 'Changelog' },
      { to: '/faq', label: 'FAQ' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme, toggle } = useTheme();

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
      )}
      <nav className={`docs-sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-back-link" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to website
          </Link>
          <div className="sidebar-logo">
            <PinpointLogo size={22} />
            <span className="sidebar-logo-text">Pinpoint</span>
            <span className="sidebar-logo-badge">docs</span>
          </div>
        </div>

        <div className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.label} className="sidebar-section">
              <div className="sidebar-section-label">{section.label}</div>
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/docs'}
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? ' active' : ''}`
                  }
                  onClick={onClose}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-npm-packages">
            <div className="sidebar-npm-label">npm packages</div>
            <a href="https://www.npmjs.com/package/@sajalmishra/markpin" target="_blank" rel="noopener noreferrer" className="sidebar-npm-link">
              @sajalmishra/markpin
            </a>
            <a href="https://www.npmjs.com/package/@sajalmishra/markpin-mcp" target="_blank" rel="noopener noreferrer" className="sidebar-npm-link">
              @sajalmishra/markpin-mcp
            </a>
            <a href="https://www.npmjs.com/package/@sajalmishra/markpin-shared" target="_blank" rel="noopener noreferrer" className="sidebar-npm-link">
              @sajalmishra/markpin-shared
            </a>
          </div>
          <div className="sidebar-footer-row">
            <a
              href="https://github.com/sjma21/Pin-Point/"
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-footer-link"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub
            </a>

            <button
              className="theme-toggle"
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
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
          </div>
        </div>
      </nav>
    </>
  );
}
