export interface TextSelectionInfo {
  selectedText: string;
  containerElement: Element | null;
  range: {
    startOffset: number;
    endOffset: number;
    startContainerSnippet: string;
  } | null;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

/** Returns the current text selection, or null if nothing is selected. */
export function getTextSelection(): TextSelectionInfo | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

  const selectedText = selection.toString().trim();
  if (!selectedText) return null;

  const range = selection.getRangeAt(0);
  const boundingRect = range.getBoundingClientRect();

  // Walk up to the nearest Element container
  let container: Node | null = range.commonAncestorContainer;
  while (container && !(container instanceof Element)) {
    container = container.parentNode;
  }

  return {
    selectedText,
    containerElement: container instanceof Element ? container : null,
    range: {
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      startContainerSnippet: range.startContainer.textContent?.slice(0, 100) ?? '',
    },
    boundingBox:
      boundingRect.width > 0
        ? {
            x: boundingRect.x,
            y: boundingRect.y,
            width: boundingRect.width,
            height: boundingRect.height,
          }
        : null,
  };
}

type SelectionHandler = (info: TextSelectionInfo) => void;

let _selectionHandler: SelectionHandler | null = null;

function onSelectionChange(): void {
  if (!_selectionHandler) return;
  const info = getTextSelection();
  if (info) _selectionHandler(info);
}

export function startSelectionDetection(handler: SelectionHandler): void {
  _selectionHandler = handler;
  document.addEventListener('selectionchange', onSelectionChange);
}

export function stopSelectionDetection(): void {
  document.removeEventListener('selectionchange', onSelectionChange);
  _selectionHandler = null;
}
