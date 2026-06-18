import { useId } from 'react';

interface PinpointLogoProps {
  size?: number;
  className?: string;
}

export default function PinpointLogo({ size = 28, className }: PinpointLogoProps) {
  const uid = useId().replace(/:/g, '');
  const bodyId = `${uid}body`;
  const dotId = `${uid}dot`;
  const glowId = `${uid}glow`;
  const shadowId = `${uid}shadow`;
  const innerGlowId = `${uid}ig`;
  const height = Math.round(size * 40 / 32);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 32 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Main body gradient — jewel-like, brighter top-left */}
        <radialGradient id={bodyId} cx="36%" cy="28%" r="72%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#a78bfa" />
          <stop offset="48%"  stopColor="#6366f1" />
          <stop offset="100%" stopColor="#312e81" />
        </radialGradient>

        {/* Center dot gradient — bright white to soft violet */}
        <radialGradient id={dotId} cx="30%" cy="25%" r="75%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="60%"  stopColor="#e0d7ff" />
          <stop offset="100%" stopColor="#a78bfa" />
        </radialGradient>

        {/* Glow for center dot */}
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Drop shadow for the whole mark */}
        <filter id={shadowId} x="-25%" y="-10%" width="150%" height="145%">
          <feDropShadow dx="0" dy="3" stdDeviation="3.5"
            floodColor="#312e81" floodOpacity="0.5" />
        </filter>

        {/* Subtle inner glow ring */}
        <filter id={innerGlowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Drop shadow layer (a copy of the shape, blurred) ── */}
      <g filter={`url(#${shadowId})`}>
        {/* Pin head circle */}
        <circle cx="16" cy="13.5" r="12" fill={`url(#${bodyId})`} />
        {/* Pin tail — smooth teardrop bezier */}
        <path
          d="M 9.8 22.5 Q 6.5 32 16 39.5 Q 25.5 32 22.2 22.5"
          fill={`url(#${bodyId})`}
        />
      </g>

      {/* ── Crosshair ticks (N / E / W) ── */}
      {/* North */}
      <line x1="16" y1="0.5"  x2="16" y2="5.5"
        stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
      {/* East */}
      <line x1="29.5" y1="13.5" x2="24.5" y2="13.5"
        stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
      {/* West */}
      <line x1="2.5" y1="13.5" x2="7.5" y2="13.5"
        stroke="white" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />

      {/* ── Reticle ring (thin inner circle) ── */}
      <circle
        cx="16" cy="13.5" r="6.5"
        stroke="white" strokeOpacity="0.25" strokeWidth="1"
        strokeDasharray="3 2.5"
        fill="none"
        filter={`url(#${innerGlowId})`}
      />

      {/* ── Center glow dot ── */}
      <circle
        cx="16" cy="13.5" r="3.2"
        fill={`url(#${dotId})`}
        filter={`url(#${glowId})`}
      />

      {/* ── Glass highlight — simulates a 3-D convex lens ── */}
      <ellipse
        cx="13.2" cy="9.2"
        rx="3.8" ry="2.1"
        fill="white" fillOpacity="0.14"
        transform="rotate(-18 13.2 9.2)"
      />

      {/* ── Fine edge ring — adds definition ── */}
      <circle
        cx="16" cy="13.5" r="12"
        stroke="white" strokeOpacity="0.12" strokeWidth="0.75"
        fill="none"
      />
    </svg>
  );
}
