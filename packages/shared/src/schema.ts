/**
 * JSON Schema for validating Annotation objects at runtime
 * (e.g. when receiving data from an MCP server or external source).
 */
export const annotationJsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://pinpoint.dev/schemas/annotation.json',
  title: 'Annotation',
  type: 'object',
  required: ['id', 'sessionId', 'createdAt', 'kind', 'intent', 'target', 'comment'],
  properties: {
    id: { type: 'string', minLength: 1 },
    sessionId: { type: 'string', minLength: 1 },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    resolvedAt: { type: 'string', format: 'date-time' },
    resolvedBy: { type: 'string' },
    kind: {
      type: 'string',
      enum: ['element', 'region', 'page', 'network', 'console', 'freeform'],
    },
    intent: {
      type: 'string',
      enum: ['bug', 'improvement', 'question', 'praise', 'task', 'note'],
    },
    severity: {
      type: 'string',
      enum: ['critical', 'high', 'medium', 'low', 'info'],
    },
    status: {
      type: 'string',
      enum: ['open', 'in_progress', 'resolved', 'dismissed', 'wont_fix'],
    },
    comment: { type: 'string', minLength: 1 },
    screenshotUrl: { type: 'string', format: 'uri' },
    screenshotDataUrl: { type: 'string' },
    index: { type: 'integer', minimum: 1 },
    tags: { type: 'array', items: { type: 'string' } },
    assignee: { type: 'string' },
    linkedAnnotationIds: { type: 'array', items: { type: 'string' } },
    target: {
      type: 'object',
      required: ['url', 'viewport'],
      properties: {
        selector: { type: 'string' },
        xpath: { type: 'string' },
        boundingBox: {
          type: 'object',
          required: ['x', 'y', 'width', 'height'],
          properties: {
            x: { type: 'number' },
            y: { type: 'number' },
            width: { type: 'number', minimum: 0 },
            height: { type: 'number', minimum: 0 },
          },
          additionalProperties: false,
        },
        textContent: { type: 'string' },
        ariaLabel: { type: 'string' },
        url: { type: 'string', format: 'uri' },
        viewport: {
          type: 'object',
          required: ['width', 'height'],
          properties: {
            width: { type: 'integer', minimum: 1 },
            height: { type: 'integer', minimum: 1 },
          },
          additionalProperties: false,
        },
        devicePixelRatio: { type: 'number', minimum: 0.5 },
      },
      additionalProperties: false,
    },
    metadata: { type: 'object' },
  },
  additionalProperties: false,
} as const;

export type AnnotationJsonSchema = typeof annotationJsonSchema;
