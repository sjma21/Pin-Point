import type { Annotation } from '@pinpoint/shared';
import { OutputFormat } from '@pinpoint/shared';

export type DetailLevel = 'compact' | 'standard' | 'detailed' | 'forensic';

// ─── Internal helpers ─────────────────────────────────────────────────────────

type Meta = Record<string, unknown>;

function getMeta(a: Annotation): Meta {
  return (a.metadata as Meta | undefined) ?? {};
}

function intentBadge(a: Annotation): string {
  const i = a.intent;
  return i.charAt(0).toUpperCase() + i.slice(1);
}

function severityTag(a: Annotation): string {
  return a.severity ? ` [${a.severity.toUpperCase()}]` : '';
}

function h2(a: Annotation, n: number): string {
  return `## Annotation #${n} — ${intentBadge(a)}${severityTag(a)}`;
}

function lines(...parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join('\n');
}

// ─── Compact ──────────────────────────────────────────────────────────────────

function compactBlock(a: Annotation, n: number): string {
  const meta = getMeta(a);
  const tag = (meta.tagName as string | undefined) ?? 'element';
  return lines(
    h2(a, n),
    `**Element:** \`${tag}\``,
    `**Path:** \`${a.target.selector ?? 'unknown'}\``,
    `**Comment:** ${a.comment}`,
    '',
  );
}

// ─── Standard ─────────────────────────────────────────────────────────────────

function standardBlock(a: Annotation, n: number): string {
  const meta = getMeta(a);
  const classList = (meta.classList as string[] | undefined)?.join(' ');
  const source = meta.sourceFile as string | undefined;
  return lines(
    h2(a, n),
    `**URL:** ${a.target.url}`,
    `**Element:** \`${meta.tagName ?? 'element'}\``,
    `**Selector:** \`${a.target.selector ?? 'unknown'}\``,
    classList ? `**Classes:** \`${classList}\`` : null,
    source ? `**Source:** \`${source}\`` : null,
    `**Position:** x=${meta.xPercent ?? '?'}% viewport · y=${meta.yDocPx ?? '?'}px from top`,
    `**Intent:** ${a.intent} · **Severity:** ${a.severity ?? 'unset'} · **Status:** ${a.status}`,
    `**Comment:** ${a.comment}`,
    '',
  );
}

// ─── Detailed ─────────────────────────────────────────────────────────────────

function detailedBlock(a: Annotation, n: number): string {
  const meta = getMeta(a);
  const bb = a.target.boundingBox;
  const classList = (meta.classList as string[] | undefined)?.join(' ');
  const react = meta.reactComponents as string | undefined;
  const source = meta.sourceFile as string | undefined;
  return lines(
    h2(a, n),
    `**URL:** ${a.target.url}`,
    `**Element:** \`${meta.tagName ?? 'element'}\``,
    `**Selector:** \`${a.target.selector ?? 'unknown'}\``,
    classList ? `**Classes:** \`${classList}\`` : null,
    source ? `**Source File:** \`${source}\`` : null,
    react ? `**React Tree:** ${react}` : null,
    bb
      ? `**Bounding Box:** x=${bb.x} y=${bb.y} w=${bb.width} h=${bb.height}`
      : null,
    a.target.textContent
      ? `**Nearby Text:** "${a.target.textContent.slice(0, 120)}"`
      : null,
    a.target.ariaLabel ? `**ARIA Label:** ${a.target.ariaLabel}` : null,
    `**Intent:** ${a.intent} · **Severity:** ${a.severity ?? 'unset'} · **Status:** ${a.status}`,
    `**Created:** ${a.createdAt}`,
    a.tags?.length ? `**Tags:** ${a.tags.join(', ')}` : null,
    `**Comment:**`,
    `> ${a.comment}`,
    '',
  );
}

// ─── Forensic ─────────────────────────────────────────────────────────────────

function forensicBlock(a: Annotation, n: number): string {
  const meta = getMeta(a);
  const styles = meta.computedStyles as Record<string, string> | undefined;
  const domPath = a.target.xpath;

  const styleLines = styles
    ? Object.entries(styles)
        .map(([k, v]) => `- **${k}:** \`${v}\``)
        .join('\n')
    : '_Not available_';

  return lines(
    detailedBlock(a, n).trimEnd(),
    '',
    '### Computed Styles',
    styleLines,
    '',
    domPath ? `### Full DOM Path\n\`\`\`\n${domPath}\n\`\`\`` : null,
    `### Raw Metadata`,
    '```json',
    JSON.stringify(meta, null, 2),
    '```',
    '',
  );
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

function blockFor(a: Annotation, n: number, level: DetailLevel): string {
  switch (level) {
    case 'compact':  return compactBlock(a, n);
    case 'standard': return standardBlock(a, n);
    case 'detailed': return detailedBlock(a, n);
    case 'forensic': return forensicBlock(a, n);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Serialize an annotation array to Markdown at one of four detail levels.
 * The `format` parameter is accepted for API symmetry with future JSON/XML
 * output — currently always produces Markdown.
 */
export function serializeAnnotations(
  annotations: Annotation[],
  level: DetailLevel = 'standard',
  format: OutputFormat = OutputFormat.Markdown,
): string {
  // format reserved for future non-Markdown output paths
  void format;

  if (annotations.length === 0) return '_No annotations._\n';

  const pageUrl = annotations[0]?.target.url ?? window.location.href;

  const header = [
    '# Pinpoint Annotations',
    '',
    `**Page:** ${pageUrl}`,
    `**Count:** ${annotations.length}`,
    `**Detail Level:** ${level}`,
    `**Generated:** ${new Date().toISOString()}`,
    '',
    '---',
    '',
  ].join('\n');

  return header + annotations.map((a, i) => blockFor(a, i + 1, level)).join('\n');
}
