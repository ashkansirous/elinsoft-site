// Lite YouTube embed: no request to YouTube until the play button is pressed.
// The iframe uses the privacy-enhanced domain and starts playing straight away.

const EMBED_ORIGIN = 'https://www.youtube-nocookie.com/embed/';
// YouTube video IDs are 11 characters of letters, digits, "-" and "_".
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{6,20}$/;

function mountPlayer(button: HTMLButtonElement): void {
  const id = button.dataset.videoId ?? '';
  if (!VIDEO_ID_PATTERN.test(id)) return;
  const frame = button.closest<HTMLElement>('[data-trailer]');
  if (!frame) return;
  const iframe = document.createElement('iframe');
  iframe.src = `${EMBED_ORIGIN}${id}?autoplay=1`;
  iframe.title = 'Dino trailer';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  button.replaceWith(iframe);
  iframe.focus();
  if (import.meta.env.DEV) console.debug('[trailer] iframe mounted after click');
}

const playButton = document.querySelector<HTMLButtonElement>('[data-trailer-play]');
playButton?.addEventListener('click', () => mountPlayer(playButton), { once: true });
