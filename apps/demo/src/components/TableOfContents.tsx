import { useEffect, useRef, useState } from 'react';

interface TocItem {
  id: string;
  label: string;
  depth?: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const headingElements = items
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((prev, cur) =>
            prev.boundingClientRect.top < cur.boundingClientRect.top ? prev : cur
          );
          setActiveId(topmost.target.id);
        }
      },
      {
        rootMargin: '0px 0px -60% 0px',
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observerRef.current!.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="docs-toc">
      <div className="toc-label">On this page</div>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`toc-link${activeId === item.id ? ' active' : ''}`}
          style={item.depth && item.depth > 1 ? { paddingLeft: '1rem' } : undefined}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(item.id);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
              setActiveId(item.id);
            }
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
