interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeBlock({ code, language, filename }: CodeBlockProps) {
  return (
    <div style={{ position: 'relative' }}>
      {filename && (
        <div
          style={{
            textAlign: 'right',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            marginBottom: '0.25rem',
          }}
        >
          {filename}
        </div>
      )}
      <pre data-language={language}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
