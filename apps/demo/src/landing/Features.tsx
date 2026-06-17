import { useEffect, useRef, RefObject } from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: '🎯',
    title: 'Smart Element Detection',
    description:
      'CSS selector, React component tree, and source file path — all captured automatically on every click. No configuration required.',
  },
  {
    icon: '📋',
    title: 'Four Output Formats',
    description:
      'Compact to Forensic. Match the detail level to your workflow, from a quick one-liner to a full debugging payload.',
  },
  {
    icon: '🔌',
    title: 'MCP Integration',
    description:
      'Real-time sync with Claude Code via the Model Context Protocol. No copy-paste, no context switching — your agent just knows.',
  },
  {
    icon: '🧩',
    title: 'Layout Mode',
    description:
      'Drag components, rearrange sections, and visualize layout changes before writing a single line of CSS.',
  },
  {
    icon: '🤖',
    title: 'Hands-Free Mode',
    description:
      'Your agent watches the annotation toolbar and fixes issues as fast as you can drop them. Review the diff when done.',
  },
  {
    icon: '💬',
    title: 'Annotation Threads',
    description:
      'Two-way conversation between you and your agent on each annotation. Ask questions, get clarification, iterate fast.',
  },
];

function useInView(ref: RefObject<Element>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fadeEls = entry.target.querySelectorAll<HTMLElement>('.fade-up');
            fadeEls.forEach((fadeEl) => fadeEl.classList.add('is-visible'));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  useInView(sectionRef as RefObject<Element>);

  return (
    <section id="features" className="features-section" ref={sectionRef}>
      <div className="container">
        {/* Header */}
        <div className="features-header fade-up">
          <span className="section-label">EVERYTHING YOU NEED</span>
          <h2 className="section-heading">
            Designed for humans.
            <br />
            Structured for agents.
          </h2>
        </div>

        {/* Feature grid */}
        <div className="features-grid">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`feature-card fade-up delay-${(i % 3) + 1}`}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
