import { useState } from 'react';

interface CodeTab {
  label: string;
  code: string;
  language?: string;
}

interface CodeTabsProps {
  tabs: CodeTab[];
}

export default function CodeTabs({ tabs }: CodeTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (tabs.length === 0) return null;

  const activeTab = tabs[activeIndex];

  return (
    <div className="code-tabs">
      <div className="code-tab-bar">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            className={`code-tab-btn${activeIndex === index ? ' active' : ''}`}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <pre data-language={activeTab.language}>
        <code>{activeTab.code}</code>
      </pre>
    </div>
  );
}
