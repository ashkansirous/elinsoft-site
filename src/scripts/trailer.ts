// Lite YouTube embed: no request to YouTube until the play button is pressed.
// The iframe uses the privacy-enhanced domain and starts playing straight away.

const EMBED_ORIGIN = 'https://www.youtube-nocookie.com/embed/';
// YouTube video IDs are 11 characters of letters, digits, "-" and "_".
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/** Returns true once the iframe replaced the button; false (and changes nothing) for a bad ID or missing frame. */
function mountPlayer(button: HTMLButtonElement): boolean {
  const id = button.dataset.videoId ?? '';
  if (!VIDEO_ID_PATTERN.test(id)) return false;
  if (!button.closest<HTMLElement>('[data-trailer]')) return false;
  const iframe = document.createElement('iframe');
  iframe.src = `${EMBED_ORIGIN}${id}?autoplay=1&rel=0&playsinline=1`;
  iframe.title = 'Dino trailer';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  button.replaceWith(iframe);
  // The pressed button is gone, so focus would fall back to the page; the player is where the user is heading.
  iframe.focus();
  if (import.meta.env.DEV) console.debug('[trailer] iframe mounted after click');
  return true;
}

// The listener stays until the iframe is mounted, so a click on an invalid ID does not use it up.
const playButton = document.querySelector<HTMLButtonElement>('[data-trailer-play]');
function onPlayClick(): void {
  if (playButton && mountPlayer(playButton)) playButton.removeEventListener('click', onPlayClick);
}
playButton?.addEventListener('click', onPlayClick);
