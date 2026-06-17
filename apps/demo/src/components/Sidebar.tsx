import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navSections = [
  {
    label: 'Getting Started',
    links: [
      { to: '/', label: 'Overview' },
      { to: '/install', label: 'Installation' },
    ],
  },
  {
    label: 'Reference',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/output', label: 'Output Formats' },
      { to: '/schema', label: 'Schema' },
      { to: '/mcp', label: 'MCP Server' },
      { to: '/api', label: 'REST API' },
    ],
  },
  {
    label: 'More',
    links: [
      { to: '/changelog', label: 'Changelog' },
      { to: '/faq', label: 'FAQ' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">📍 Pinpoint</span>
          <span className="sidebar-logo-badge">beta</span>
        </div>
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
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
      </nav>
    </>
  );
}
