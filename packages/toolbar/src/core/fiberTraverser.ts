export type FiberDetailLevel = 'filtered' | 'smart' | 'all';

export interface FiberResult {
  componentHierarchy: string;
  components: string[];
  found: boolean;
}

// Minimal shape of a React fiber node — enough for traversal
interface FiberNode {
  type?: FiberType | string | null;
  return?: FiberNode | null;
}

interface FiberType {
  displayName?: string;
  name?: string;
  render?: { displayName?: string; name?: string };
}

const FRAMEWORK_NAMES = new Set([
  'Router', 'BrowserRouter', 'HashRouter', 'MemoryRouter', 'Routes', 'Route',
  'Switch', 'Provider', 'Consumer', 'Suspense', 'Fragment', 'StrictMode',
  'Profiler', 'ErrorBoundary', 'Transition', 'AnimatePresence',
  'Portal', 'QueryClientProvider', 'ThemeProvider',
]);

function isInternalComponent(name: string): boolean {
  if (/^[a-z]/.test(name)) return true; // React DOM elements
  if (FRAMEWORK_NAMES.has(name)) return true;
  if (name === 'Anonymous' || name === 'Unknown') return true;
  // Context objects pattern: "Foo.Provider", "Foo.Consumer"
  if (/\.(Provider|Consumer)$/.test(name)) return true;
  return false;
}

function nameFromType(type: FiberType | string | null | undefined): string | null {
  if (!type) return null;
  if (typeof type === 'string') return null; // DOM element type (div, span…)
  return (
    type.displayName ??
    type.name ??
    type.render?.displayName ??
    type.render?.name ??
    null
  );
}

function findFiberKey(el: Element): string | null {
  return (
    Object.keys(el).find(
      k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'),
    ) ?? null
  );
}

function collectNames(
  fiber: FiberNode,
  level: FiberDetailLevel,
  classList: string[],
): string[] {
  const names: string[] = [];
  let node: FiberNode | null | undefined = fiber;

  while (node) {
    const name = nameFromType(node.type as FiberType | string | null | undefined);
    if (name) {
      if (level === 'all') {
        names.push(name);
      } else if (level === 'filtered' && !isInternalComponent(name)) {
        names.push(name);
      } else if (level === 'smart') {
        // Include user components plus any component whose kebab-case name
        // overlaps with an existing CSS class (helpful correlation hint).
        const kebab = name.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`).replace(/^-/, '');
        const overlaps = classList.some(
          cls =>
            cls.toLowerCase().includes(kebab.toLowerCase()) ||
            kebab.toLowerCase().includes(cls.toLowerCase()),
        );
        if (!isInternalComponent(name) || overlaps) names.push(name);
      }
    }
    node = node.return;
  }

  return names.reverse(); // ancestor-first
}

export function traverseFiber(
  el: Element,
  level: FiberDetailLevel = 'filtered',
): FiberResult {
  try {
    const key = findFiberKey(el);
    if (!key) return { componentHierarchy: '', components: [], found: false };

    const fiber = (el as unknown as Record<string, FiberNode>)[key];
    if (!fiber) return { componentHierarchy: '', components: [], found: false };

    const classList = Array.from(el.classList);
    const components = collectNames(fiber, level, classList);

    return {
      componentHierarchy: components.join(' > '),
      components,
      found: components.length > 0,
    };
  } catch {
    return { componentHierarchy: '', components: [], found: false };
  }
}
