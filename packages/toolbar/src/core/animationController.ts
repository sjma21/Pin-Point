interface PausedEntry {
  animation: Animation;
  wasRunning: boolean;
}

let _paused = false;
let _pausedEntries: PausedEntry[] = [];
let _injectedStyle: HTMLStyleElement | null = null;
let _mediaElements: Array<HTMLVideoElement | HTMLAudioElement> = [];

const PAUSE_STYLE_ID = '__pinpoint_anim_pause';

function injectPauseCSS(): HTMLStyleElement {
  const existing = document.getElementById(PAUSE_STYLE_ID);
  if (existing instanceof HTMLStyleElement) return existing;

  const style = document.createElement('style');
  style.id = PAUSE_STYLE_ID;
  // Belt-and-suspenders: covers CSS animations not yet instantiated as
  // Web Animation objects (e.g. on elements inserted after getAnimations() ran).
  style.textContent = `*, *::before, *::after {
    animation-play-state: paused !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }`;
  document.head.appendChild(style);
  return style;
}

export function pauseAnimations(): void {
  if (_paused) return;
  _paused = true;

  // Web Animations API — covers all running animations at this moment
  _pausedEntries = [];
  if (typeof document.getAnimations === 'function') {
    for (const anim of document.getAnimations()) {
      const wasRunning = anim.playState === 'running';
      _pausedEntries.push({ animation: anim, wasRunning });
      if (wasRunning) {
        try { anim.pause(); } catch { /* read-only or already finished */ }
      }
    }
  }

  // CSS blanket — catches animations the Web Animations API might miss
  _injectedStyle = injectPauseCSS();

  // HTML5 media
  _mediaElements = Array.from(
    document.querySelectorAll<HTMLVideoElement | HTMLAudioElement>('video, audio'),
  );
  for (const el of _mediaElements) {
    try { el.pause(); } catch { /* not ready */ }
  }
}

export function resumeAnimations(): void {
  if (!_paused) return;
  _paused = false;

  for (const { animation, wasRunning } of _pausedEntries) {
    if (wasRunning) {
      try { animation.play(); } catch { /* finished or detached */ }
    }
  }
  _pausedEntries = [];

  _injectedStyle?.remove();
  _injectedStyle = null;

  // Media elements: only resume those that were playing (we can't know which
  // were already paused by the user, so we resume all we touched).
  for (const el of _mediaElements) {
    const p = el.play();
    // play() returns a Promise; silence the rejection when autoplay is blocked
    p?.catch(() => undefined);
  }
  _mediaElements = [];
}

export function areAnimationsPaused(): boolean {
  return _paused;
}

/** Toggle pause/resume. Returns true if now paused. */
export function toggleAnimations(): boolean {
  if (_paused) {
    resumeAnimations();
    return false;
  }
  pauseAnimations();
  return true;
}
