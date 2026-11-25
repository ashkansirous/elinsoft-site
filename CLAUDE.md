# elinsoft-site

The company site for ELINSOFT LTD: `elinsoft.co.uk/` (home), `/dino` (scroll story), `/privacy`, 404. Astro 7, static output, plain CSS, vanilla TypeScript. Deployed as the static-assets Worker `elinsoft-site` (`wrangler.jsonc`) by Cloudflare Workers Builds on merge to `main` only (never deploy from a shell).

## Commands

- `npm ci` then `npm run dev` (port 4321), `npm run build` (to `dist/`), `npm run preview`
- `npx astro check` must report 0 errors, 0 warnings
- `npm run icons` regenerates `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `og.png` from `scripts/fonts/` (outputs are committed)

## Map

- `src/data/links.ts`: every placeholder (store URLs, Amazon link, YouTube ID, covers, screenshots) and the company facts
- `src/layouts/Layout.astro`: head, meta, skip link, header slot (default `Header`), footer
- `src/components/`: `Mark`, `Wordmark` (`--smiley-y`, `--smiley-size`), `Smiley`, `DinoMark`, `Header`, `Footer`, `StoreButtons`; `story/` holds the /dino visuals
- `src/styles/global.css` (brand tokens), `src/styles/story.css` (/dino only)
- `src/scripts/story.ts` (scroll story), `trailer.ts` (lite YouTube embed); `public/story-boot.js` sets `story--animated` before first paint
- `public/_headers`: security headers and CSP

## Rules

- Placeholders live only in `src/data/links.ts`, as `null` with a `// TODO(owner):` comment. Never invent URLs, ratings, reviews or download counts. A `null` store link renders as a disabled non-link, never `href="#"`.
- The only address on the site is the registered office, 128 City Road, London, EC1V 2NX. No other address.
- No tracking, analytics or cookies. The only third-party request on load is Google Fonts; YouTube loads only after a click.
- The CSP allows no inline scripts or `style=""` attributes: keep scripts external (Astro `<script>` bundles) and set dynamic values from script through CSSOM, never as inline markup.
- `/dino` scroll story: the script writes only `opacity`, `transform` and CSS custom properties. Without JS or with `prefers-reduced-motion: reduce` the six scenes are a plain vertical stack (the default CSS).
- Brand colours are fixed; darken text, never the brand fills, when contrast is short.
