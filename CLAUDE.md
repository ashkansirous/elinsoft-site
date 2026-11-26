# elinsoft-site

The company site for ELINSOFT LTD: `elinsoft.co.uk/` (home), `/dino` (scroll story), `/privacy`, 404. Astro 7, static output, plain CSS, vanilla TypeScript. Deployed as the static-assets Worker `elinsoft-site` (`wrangler.jsonc`) by Cloudflare Workers Builds on merge to `main` only (never deploy from a shell).

## Commands

- `npm ci` then `npm run dev` (port 4321), `npm run build` (to `dist/`), `npm run preview`
- `npx astro check` must report 0 errors, 0 warnings
- `npm test` runs `node --test` (the analytics gate)
- `npm run icons` regenerates `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `og.png` and `og-dino.png` from `scripts/fonts/` (outputs are committed)

## Map

- `src/data/links.ts`: store URLs, the two remaining placeholders (Amazon link, YouTube ID) and the company facts
- `src/assets/` + `src/data/assets.ts`: the real pictures (app icons, covers, book pages, app screenshots), all rendered through `<Picture>` (AVIF/WebP + fallback); `public/audio/` holds the one narration clip (`listen.ts`, tap only)
- `src/layouts/Layout.astro`: head, meta, skip link, header slot (default `Header`), footer
- `src/components/`: `Mark`, `Wordmark` (`--smiley-y`, `--smiley-size`), `Smiley`, `DinoMark`, `Header`, `Footer`, `StoreButtons`; `story/` holds the /dino visuals
- `src/styles/global.css` (brand tokens), `src/styles/story.css` (/dino only)
- `src/scripts/story.ts` (scroll story), `trailer.ts` (lite YouTube embed); `public/story-boot.js` sets `story--animated` before first paint
- `src/data/seo.ts` (JSON-LD, sitemap paths), `src/pages/sitemap.xml.ts`, `public/robots.txt`
- `src/components/ConsentBanner.astro`, `src/scripts/analytics.ts` (GA4 after consent), `analytics-gate.ts` (who counts); `tests/` holds the gate tests
- `public/_headers`: security headers and CSP

## Rules

- Placeholders live only in `src/data/links.ts`, as `null` with a `// TODO(owner):` comment. Never invent URLs, ratings, reviews or download counts. A `null` store link renders as a disabled non-link, never `href="#"`.
- The only address on the site is the registered office, 128 City Road, London, EC1V 2NX. No other address.
- Google Analytics 4 only after the visitor presses "Accept analytics" (`src/scripts/analytics.ts`); before that, and after Reject, nothing goes to Google Analytics. Analytics count only real visitors on elinsoft.co.uk / www (`analytics-gate.ts`: never automated browsers, dev builds or other hosts). No ads, no other tracking. The only third-party request on load is Google Fonts; YouTube loads only after a click. E2E tests block Google's analytics hosts at the network layer.
- JSON-LD holds only facts from `links.ts`: never offers, prices, ratings or reviews.
- The CSP allows no inline scripts or `style=""` attributes: keep scripts external (Astro `<script>` bundles) and set dynamic values from script through CSSOM, never as inline markup.
- `/dino` scroll story: the script writes only `opacity`, `transform` and CSS custom properties. Without JS or with `prefers-reduced-motion: reduce` the six scenes are a plain vertical stack (the default CSS).
- Brand colours are fixed; darken text, never the brand fills, when contrast is short.
