export interface PageSection {
  element: HTMLElement;
  selector: string;
  label: string;
  originalRect: DOMRect;
  index: number;
}

class LayoutController {
  private _sections: PageSection[] = [];
  private _savedScrollY = 0;
  private _active = false;

  get active(): boolean { return this._active; }
  get sections(): PageSection[] { return this._sections; }

  activate(): PageSection[] {
    if (this._active) return this._sections;
    this._active = true;
    this._savedScrollY = window.scrollY;
    // Lock scroll in place without jumping — compensate for scrollbar disappearing
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    this._sections = this._scanSections();
    return this._sections;
  }

  deactivate(): void {
    if (!this._active) return;
    this._active = false;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    this._sections = [];
  }

  private _scanSections(): PageSection[] {
    const seen = new Set<HTMLElement>();
    const results: PageSection[] = [];

    const containers = [
      ...Array.from(document.querySelectorAll<HTMLElement>('main')),
      ...Array.from(document.querySelectorAll<HTMLElement>('article')),
      document.body,
    ];

    for (const container of containers) {
      for (const child of Array.from(container.children) as HTMLElement[]) {
        if (seen.has(child)) continue;
        if (child.closest('[data-pinpoint]')) continue;
        const rect = child.getBoundingClientRect();
        if (rect.height > 100) {
          seen.add(child);
          results.push({
            element: child,
            selector: this._makeSelector(child),
            label: this._inferLabel(child),
            originalRect: rect,
            index: results.length,
          });
        }
      }
    }

    return results;
  }

  private _makeSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    const tag = el.tagName.toLowerCase();
    const classes = Array.from(el.classList).slice(0, 2).map(c => `.${c}`).join('');
    return `${tag}${classes}`;
  }

  private _inferLabel(el: HTMLElement): string {
    const heading = el.querySelector('h1,h2,h3,h4,h5,h6');
    if (heading?.textContent?.trim()) {
      return heading.textContent.trim().slice(0, 50);
    }
    const tag = el.tagName.toLowerCase();
    const id = el.id ? ` #${el.id}` : '';
    const role = el.getAttribute('aria-label') ?? el.getAttribute('role') ?? '';
    if (role) return `${tag}[${role}]`;
    if (id) return `<${tag}${id}>`;
    return `<${tag}>`;
  }
}

export const layoutController = new LayoutController();
