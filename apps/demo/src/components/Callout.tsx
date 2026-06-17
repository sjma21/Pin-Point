import React from 'react';

type CalloutType = 'info' | 'warning' | 'success' | 'danger';

interface CalloutProps {
  type: CalloutType;
  children: React.ReactNode;
}

const iconMap: Record<CalloutType, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  danger: '🚫',
};

export default function Callout({ type, children }: CalloutProps) {
  return (
    <div className={`callout callout-${type}`}>
      <span className="callout-icon">{iconMap[type]}</span>
      <div className="callout-body">{children}</div>
    </div>
  );
}
