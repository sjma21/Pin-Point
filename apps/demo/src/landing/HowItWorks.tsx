import { useEffect, useRef, RefObject, Fragment } from 'react';

// ── useInView hook ─────────────────────────────────────────────
function useInView(
  ref: RefObject<Element>,
  options: IntersectionObserverInit = {}
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fadeEls = entry.target.querySelectorAll<HTMLElement>('.fade-up');
            fadeEls.forEach((fadeEl) => {
              fadeEl.classList.add('is-visible');
            });
            // Once visible, stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [ref, options]);
}

// ── Step data ──────────────────────────────────────────────────
interface Step {
  number: string;
  icon: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: '01',
    icon: '🖱️',
    title: 'Click any element',
    description:
      'Activate the Pinpoint toolbar and click any element in your running app. The overlay highlights exactly what you\'re targeting.',
  },
  {
    number: '02',
    icon: '💬',
    title: 'Add your feedback',
    description:
      'Write your comment, choose intent (bug, improvement, question) and severity, then hit Add. Takes under 10 seconds.',
  },
  {
    number: '03',
    icon: '🤖',
    title: 'Agent acts on it',
    description:
      'Your AI agent reads structured context — selector, component tree, file path — and fixes the code with precision.',
  },
];

interface FlowItem {
  label: string;
  brand?: boolean;
}

const FLOW_ITEMS: FlowItem[] = [
  { label: 'Browser toolbar' },
  { label: 'Structured annotation', brand: true },
  { label: 'Claude Code', brand: true },
  { label: 'Code fix' },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  useInView(sectionRef as RefObject<Element>);

  return (
    <section
      id="how-it-works"
      className="how-section"
      ref={sectionRef}
    >
      <div className="container">
        {/* Header */}
        <div className="how-header fade-up">
          <span className="section-label">SIMPLE BY DESIGN</span>
          <h2 className="section-heading">From feedback to fix in seconds</h2>
        </div>

        {/* Steps */}
        <div className="how-steps">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`how-step fade-up delay-${i + 1}`}
            >
              <div className="how-step-number">{step.number}</div>
              <div className="how-step-icon">{step.icon}</div>
              <h3 className="how-step-title">{step.title}</h3>
              <p className="how-step-desc">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Flow diagram */}
        <div className="how-flow fade-up delay-4">
          {FLOW_ITEMS.map((item, i) => (
            <Fragment key={item.label}>
              <span className={`how-flow-pill${item.brand ? ' brand' : ''}`}>
                {item.label}
              </span>
              {i < FLOW_ITEMS.length - 1 && (
                <span className="how-flow-arrow">→</span>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
