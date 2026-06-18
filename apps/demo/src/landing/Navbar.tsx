import { useEffect, useState } from 'react';
import PinpointLogo from '../components/PinpointLogo';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobile = () => setMobileOpen((prev) => !prev);

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className={`nav${isScrolled ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="/" className="nav-logo">
          <PinpointLogo size={24} />
          Pinpoint
        </a>

        <div className="nav-links">
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#how-it-works" className="nav-link">
            How it Works
          </a>
          <a href="#demo" className="nav-link">
            Demo
          </a>
          <a href="/docs" className="nav-link">
            Docs
          </a>
        </div>

        <div className="nav-actions">
          <a
            href="https://github.com/sjma21/Pin-Point/"
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
          <a href="/demo" className="btn-primary btn-sm">
            Try Demo →
          </a>
        </div>

        <button
          className="nav-hamburger"
          onClick={toggleMobile}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileOpen && (
        <div className="nav-mobile">
          <a href="#features" className="nav-link" onClick={closeMobile}>
            Features
          </a>
          <a href="#how-it-works" className="nav-link" onClick={closeMobile}>
            How it Works
          </a>
          <a href="#demo" className="nav-link" onClick={closeMobile}>
            Demo
          </a>
          <a href="/docs" className="nav-link" onClick={closeMobile}>
            Docs
          </a>
          <a
            href="https://github.com/sjma21/Pin-Point/"
            className="nav-link"
            onClick={closeMobile}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
          <a href="/demo" className="btn-primary" onClick={closeMobile}>
            Try Demo →
          </a>
        </div>
      )}
    </nav>
  );
}
