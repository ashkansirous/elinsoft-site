// Runs before first paint (external, so the CSP needs no inline script): turns on the animated /dino layout only
// when the visitor has not asked for reduced motion, so the page never flashes the stacked layout first.
// src/scripts/story.ts keeps the same class in sync afterwards, including when the preference changes.
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  document.documentElement.classList.add('story--animated');
}
