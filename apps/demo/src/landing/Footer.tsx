import PinpointLogo from '../components/PinpointLogo';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const FOOTER_LINKS: FooterLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Demo', href: '/demo' },
  { label: 'Docs', href: '/install' },
  { label: 'GitHub', href: 'https://github.com/sjma21/Pin-Point/', external: true },
  { label: 'Changelog', href: '/changelog' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        {/* Top row */}
        <div className="footer-top">
          {/* Left — brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <PinpointLogo size={22} />
              Pinpoint
            </div>
            <p className="footer-tagline">
              Visual feedback for AI coding agents.
            </p>
          </div>

          {/* Center — nav links */}
          <nav className="footer-nav" aria-label="Footer navigation">
            <div className="footer-nav-links">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="footer-nav-link"
                  {...(link.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Right — tagline */}
          <div className="footer-right">
            <p className="footer-right-text">
              Built for developers who use AI
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom row */}
        <div className="footer-bottom">
          MIT License · Made with ❤️ for the AI coding community · © {currentYear} Pinpoint
        </div>
      </div>
    </footer>
  );
}
