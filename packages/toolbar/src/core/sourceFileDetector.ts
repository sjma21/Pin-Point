export interface SourceInfo {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
  /** "src/components/Button.tsx:42" */
  formatted: string;
}

interface DebugSource {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
}

interface FiberNode {
  _debugSource?: DebugSource;
  return?: FiberNode | null;
}

function findFiberKey(el: Element): string | null {
  return (
    Object.keys(el).find(
      k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'),
    ) ?? null
  );
}

function walkForSource(fiber: FiberNode): SourceInfo | null {
  let node: FiberNode | null | undefined = fiber;
  while (node) {
    if (node._debugSource) {
      const { fileName, lineNumber, columnNumber } = node._debugSource;
      return {
        fileName,
        lineNumber,
        columnNumber,
        formatted: `${fileName}:${lineNumber}`,
      };
    }
    node = node.return;
  }
  return null;
}

export function detectSourceFile(el: Element): SourceInfo | null {
  try {
    const key = findFiberKey(el);
    if (!key) return null;
    const fiber = (el as unknown as Record<string, FiberNode>)[key];
    if (!fiber) return null;
    return walkForSource(fiber);
  } catch {
    return null;
  }
}
