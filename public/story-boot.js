// Runs before first paint (external, so the CSP needs no inline script): turns on the animated /dino layout only
// when the visitor has not asked for reduced motion, so the page never flashes the stacked layout first.
// src/scripts/story.ts keeps the same class in sync afterwards, including when the preference changes.
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  document.documentElement.classList.add('story--animated');
  // Self-healing fallback: if story.ts has not confirmed it started (blocked, failed to load or threw), go back to the
  // stacked layout so every scene stays reachable. The fallback is permanent for this page view: it sets
  // data-story-fallback, which story.ts honours, so a late start never snaps the layout back under the reader.
  window.setTimeout(function () {
    if (!document.documentElement.hasAttribute('data-story-ready')) {
      document.documentElement.setAttribute('data-story-fallback', '');
      document.documentElement.classList.remove('story--animated');
    }
  }, 4000);
}
