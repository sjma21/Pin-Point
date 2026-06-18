import type { Annotation, AnnotationTarget } from '@sajalmishra/markpin-shared';
import {
  AnnotationKind,
  AnnotationIntent,
  AnnotationSeverity,
  AnnotationStatus,
  generateId,
  now,
} from '@sajalmishra/markpin-shared';
import type { DetectedElement } from './elementDetector.js';
import { generateSelector } from './selectorGenerator.js';
import { traverseFiber } from './fiberTraverser.js';
import { detectSourceFile } from './sourceFileDetector.js';

export interface AnnotationBuildOptions {
  sessionId: string;
  comment: string;
  intent?: AnnotationIntent;
  severity?: AnnotationSeverity;
  tags?: string[];
  screenshotDataUrl?: string;
  index?: number;
}

export interface AnnotationBuildInput {
  element: Element;
  /** Pre-computed detection info; if omitted the builder re-computes it */
  detected?: DetectedElement;
  options: AnnotationBuildOptions;
}

function isFixed(el: Element): boolean {
  let cur: Element | null = el;
  while (cur && cur !== document.body) {
    const pos = window.getComputedStyle(cur).position;
    if (pos === 'fixed' || pos === 'sticky') return true;
    cur = cur.parentElement;
  }
  return false;
}

export function buildAnnotation(input: AnnotationBuildInput): Annotation {
  const { element, detected, options } = input;
  const { selector, domPath } = generateSelector(element);
  const fiber = traverseFiber(element, 'filtered');
  const source = detectSourceFile(element);

  const rect = element.getBoundingClientRect();
  const fixed = isFixed(element);
  const scrollY = fixed ? 0 : window.scrollY;
  const scrollX = fixed ? 0 : window.scrollX;

  const absTop = rect.top + scrollY;
  const absLeft = rect.left + scrollX;

  const target: AnnotationTarget = {
    selector,
    xpath: domPath,
    boundingBox: {
      x: Math.round(absLeft),
      y: Math.round(absTop),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
    textContent:
      detected?.nearbyText ||
      element.textContent?.trim().slice(0, 200) ||
      undefined,
    ariaLabel:
      detected?.ariaLabel ??
      element.getAttribute('aria-label') ??
      undefined,
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    devicePixelRatio: window.devicePixelRatio,
  };

  const annotation: Annotation = {
    id: generateId('ann'),
    sessionId: options.sessionId,
    createdAt: now(),
    kind: AnnotationKind.Element,
    intent: options.intent ?? AnnotationIntent.Bug,
    severity: options.severity ?? AnnotationSeverity.Medium,
    status: AnnotationStatus.Open,
    target,
    comment: options.comment,
    tags: options.tags,
    index: options.index,
    screenshotDataUrl: options.screenshotDataUrl,
    metadata: {
      tagName: detected?.tagName ?? element.tagName.toLowerCase(),
      classList: detected?.classList ?? Array.from(element.classList),
      computedStyles: detected?.computedStyles,
      reactComponents: fiber.found ? fiber.componentHierarchy : undefined,
      sourceFile: source?.formatted,
      xPercent: Math.round((rect.left / window.innerWidth) * 100),
      yDocPx: Math.round(absTop),
      isFixed: fixed,
    },
  };

  return annotation;
}
