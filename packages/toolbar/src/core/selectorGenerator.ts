export interface SelectorResult {
  /** Shortest unique selector, e.g. "body > main > .hero-section > button.cta" */
  selector: string;
  /** Every ancestor from html down, e.g. "html > body > main > section > button" */
  domPath: string;
}

const SEMANTIC_TAGS = new Set([
  'main', 'header', 'footer', 'nav', 'section', 'article', 'aside',
  'form', 'table', 'thead', 'tbody', 'tr', 'dialog', 'details', 'summary',
  'ul', 'ol', 'li',
]);

const INTERACTIVE_TAGS = new Set(['button', 'a', 'label', 'summary']);

/** Produce a readable segment for a single element. */
function segmentFor(el: Element): string {
  const tag = el.tagName.toLowerCase();

  if (el.id) return `#${el.id}`;

  // Meaningful classes — skip single-letter, utility prefixes, and numeric hashes
  const classes = Array.from(el.classList).filter(
    c => c.length > 1 && !/^(js-|is-|has-|v-|ng-|data-|[0-9])/.test(c) && !/^[a-z0-9]{8,}$/.test(c),
  );

  // For interactive elements, add a text-content hint when available
  const rawText = el.textContent?.trim().slice(0, 30) ?? '';
  const textHint = INTERACTIVE_TAGS.has(tag) && rawText ? `[text="${rawText}"]` : '';

  if (classes.length > 0) {
    return `${tag}.${classes.slice(0, 3).join('.')}${textHint}`;
  }

  if (SEMANTIC_TAGS.has(tag) || INTERACTIVE_TAGS.has(tag)) {
    return `${tag}${textHint}`;
  }

  // Positional fallback among siblings of the same tag
  const parent = el.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
    if (siblings.length > 1) {
      return `${tag}:nth-of-type(${siblings.indexOf(el) + 1})`;
    }
  }

  return tag;
}

export function generateSelector(el: Element): SelectorResult {
  // Build shortened selector — stop at an ID anchor
  const shortAncestors: Element[] = [];
  let cur: Element | null = el;
  while (cur && cur.tagName.toLowerCase() !== 'html') {
    shortAncestors.unshift(cur);
    if (cur.id) break; // ID is globally unique — no need to go further
    cur = cur.parentElement;
  }

  // Build full DOM path for forensic output
  const domParts: string[] = [];
  let walker: Element | null = el;
  while (walker && walker.tagName.toLowerCase() !== 'html') {
    const tag = walker.tagName.toLowerCase();
    const suffix = walker.id ? `#${walker.id}` : '';
    domParts.unshift(`${tag}${suffix}`);
    walker = walker.parentElement;
  }

  return {
    selector: shortAncestors.map(segmentFor).join(' > '),
    domPath: domParts.join(' > '),
  };
}
