// "Tap to hear" on /dino scene 3: plays one real narration clip, only after a tap (never autoplay), and a second tap
// stops it. The button is hidden in the markup and shown here, so it appears only when this script runs.

const PLAYING_CLASS = 'is-playing';
const LABEL_IDLE = 'Tap to hear';
const LABEL_LOADING = 'Loading...';
const LABEL_PLAYING = 'Stop';
const MESSAGE_FAILED = 'Sorry, the clip could not play. Tap to try again.';
const LOADING_DELAY_MS = 500;

type State = 'idle' | 'loading' | 'playing';

interface Parts {
  button: HTMLButtonElement;
  audio: HTMLAudioElement;
  label: HTMLElement;
  note: HTMLElement | null;
}

function render(parts: Parts, state: State): void {
  const { button, label } = parts;
  button.classList.toggle(PLAYING_CLASS, state === 'playing');
  if (state === 'loading') button.setAttribute('aria-busy', 'true');
  else button.removeAttribute('aria-busy');
  label.textContent = state === 'playing' ? LABEL_PLAYING : state === 'loading' ? LABEL_LOADING : LABEL_IDLE;
}

function showNote(parts: Parts, message: string): void {
  if (!parts.note) return;
  parts.note.textContent = message;
  parts.note.hidden = message === '';
}

function stop(audio: HTMLAudioElement): void {
  audio.pause();
  audio.currentTime = 0;
}

/** Stops the clip whenever its scene stops being the one on screen, or the page is hidden. */
function stopWhenAway(button: HTMLButtonElement, audio: HTMLAudioElement): void {
  const stopIfPlaying = () => {
    if (!audio.paused) stop(audio);
  };
  const scene = button.closest<HTMLElement>('[data-scene]');
  if (scene) {
    new MutationObserver(() => {
      if (scene.hasAttribute('inert')) stopIfPlaying();
    }).observe(scene, { attributes: true, attributeFilter: ['inert'] });
    new IntersectionObserver((entries) => {
      if (entries.some((entry) => !entry.isIntersecting)) stopIfPlaying();
    }).observe(scene);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopIfPlaying();
  });
}

function wire(button: HTMLButtonElement): void {
  const audio = button.parentElement?.querySelector<HTMLAudioElement>('[data-listen-audio]');
  const label = button.querySelector<HTMLElement>('[data-listen-label]');
  if (!audio || !label) return;
  const parts: Parts = { button, audio, label, note: button.parentElement?.querySelector<HTMLElement>('[data-listen-note]') ?? null };
  let loadingTimer = 0;
  let current: State = 'idle';
  const settle = (state: State) => {
    window.clearTimeout(loadingTimer);
    current = state;
    render(parts, state);
  };
  const fail = () => {
    settle('idle');
    showNote(parts, MESSAGE_FAILED);
  };
  audio.addEventListener('ended', () => settle('idle'));
  audio.addEventListener('pause', () => settle('idle'));
  audio.addEventListener('playing', () => settle('playing'));
  audio.addEventListener('error', fail);
  button.addEventListener('click', () => {
    if (current !== 'idle') {
      stop(audio);
      settle('idle');
      return;
    }
    showNote(parts, '');
    current = 'loading';
    window.clearTimeout(loadingTimer);
    loadingTimer = window.setTimeout(() => {
      if (current === 'loading') render(parts, 'loading');
    }, LOADING_DELAY_MS);
    audio.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      fail();
    });
  });
  stopWhenAway(button, audio);
  render(parts, 'idle');
  button.hidden = false;
}

document.querySelectorAll<HTMLButtonElement>('[data-listen]').forEach(wire);
