# Slice 1: elinsoft.co.uk static site (home, /dino, /privacy, 404)

**Status:** built, awaiting review (2026-11-25)
**Touches:** everything (first slice, new repo)

The owner's brief below is the spec. Follow every line of it. The *Decisions* section settles what the brief leaves open; where they differ, the brief wins unless a decision says it overrides.

## Decisions (settled by the coordinating session)

1. **Stack:** Astro 7 (`astro@^7`), static output, plain CSS, vanilla JS in Astro `<script>` tags (bundled, no frameworks, no GSAP). Node 24. TypeScript strict (`astro/tsconfigs/strict`).
2. **URLs:** `build.format: 'file'` and `trailingSlash: 'never'`, so pages build to `index.html`, `dino.html`, `privacy.html`, `404.html`. Cloudflare Pages serves `dino.html` at `/dino` exactly. `site: 'https://elinsoft.co.uk'`.
3. **Fonts:** Google Fonts stylesheet (Fraunces 300/700, Inter 400/500/600/800, `display=swap`) with `preconnect` to fonts.googleapis.com and fonts.gstatic.com. This is the only third-party request. CSP must allow it.
4. **Icon pipeline:** `scripts/make-icons.mjs` (dev dependency only, run by `npm run icons`, outputs committed to `public/`). Use `opentype.js` to turn the Fraunces Bold "E" into an SVG path (favicon/OG must not depend on a web font), and `@resvg/resvg-js` to rasterise. Download Fraunces static TTFs (Bold and Light, from the google/fonts GitHub repo, OFL) into `scripts/fonts/` and commit them with the OFL licence file. Outputs: `public/favicon.svg`, `public/favicon-32.png`, `public/apple-touch-icon.png` (180, mark on blush or solid background, no transparency), `public/og.png` (1200x630, wordmark with smiley on blush #FFE8F3, mark optional). Wire all of them in the shared layout head (`og:image` absolute URL, `twitter:card summary_large_image`).
5. **Shared components:** `Mark.astro` (props: size, title/decorative), `Wordmark.astro` (smiley i, CSS variable `--smiley-y` on the wordmark root controls the smiley's vertical offset; also expose `--smiley-size` defaulting to 0.3em), `Header.astro`, `Footer.astro`, `StoreButtons.astro`, `Layout.astro` (head, meta, skip link, header, footer slot). The /dino page uses its own sticky top bar instead of the home header (brief says so) but the same footer.
6. **Placeholders:** one file `src/data/links.ts`, every unknown value `null` with a `// TODO(owner):` comment. Typed. Nothing invented: no URLs, ratings, reviews, download counts.
   - A store button whose URL is `null` renders as a non-link `<span>` styled as a muted button with the store name and a small "coming soon" line, `aria-disabled="true"`. Never `href="#"`.
   - Paperbacks button: `null` → non-link "Paperbacks coming soon"; set → link "Buy the paperbacks" (`rel="noopener"`, external).
   - YouTube ID `null` → poster with a yellow play button that is visibly disabled and the caption "Trailer coming soon"; set → lite embed: button click swaps in `https://www.youtube-nocookie.com/embed/<id>?autoplay=1` iframe (no YouTube request before click). CSP `frame-src` allows youtube-nocookie.com.
   - Book covers and app screenshots: `null` image paths → tinted placeholder tiles (lilac/aqua/cream/blush) with the title as real text.
7. **Scroll story (/dino):** one `<section>` track ~600vh with a `position: sticky; top: 0; height: 100vh` (use `100svh` with `100vh` fallback) stage. One rAF loop, started/stopped by an IntersectionObserver on the track, reads `scrollY` once per frame (cache track offset/height on load and resize via ResizeObserver), computes progress 0..1 and scene index + local progress, and writes only `transform`, `opacity` and CSS custom properties. Background colour transitions by cross-fading six full-screen colour layers via opacity (no `background-color` animation per frame). Scene captions are real `<h2>` + `<p>` elements in DOM order. Progress dots: six `<a>` links to each scene's scroll position, `aria-current` on the active one. Visuals are inline SVG/CSS: moon, purple book with a smiley that opens with a turning page (transform rotateY driven by scene-2 local progress), sound-wave rings pulsing (scene 3, then pink in scene 4), "Grandma, recording" pink avatar with mic sliding in (scene 4), device outlines iPhone, iPad, Windows laptop, Sonos speaker appearing one by one (scene 5), scene 6 purple with the headline. Mobile (<768px): visual on top, caption below, both inside the stage.
8. **Reduced motion and no-JS:** default CSS (no JS, or `prefers-reduced-motion: reduce`) shows the six scenes as a normal vertical stack, each scene its own full-width block with its own background colour, no sticky, no animation. JS adds a `story--animated` class only when `matchMedia('(prefers-reduced-motion: no-preference)')` matches, and listens for changes.
9. **Headings:** each page has one `h1`. Home: hero h1, sections h2, cards h3. /dino: h1 is the page title (visually the scene-1 heading "It's bedtime." may be the h1, or an sr-only h1 "Dino: Kids Books & Stories" then scenes as h2; pick one and keep order valid).
10. **Focus:** visible `:focus-visible` outline (3px, ink or sun depending on background, offset 3px) on all interactive elements; skip link to `#main`.
11. **Headers file:** `public/_headers` with: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` (camera, microphone, geolocation, interest-cohort off), `Strict-Transport-Security: max-age=31536000; includeSubDomains`, a `Content-Security-Policy` that allows self, Google Fonts (style and font), youtube-nocookie frames, `img-src 'self' data: https://i.ytimg.com`, Astro's inline scripts/styles as needed (check the build output; prefer no `unsafe-inline` for scripts by keeping scripts external, set `build.inlineStylesheets` accordingly). `/_astro/*` gets `Cache-Control: public, max-age=31536000, immutable`; HTML gets a short cache.
12. **Cloudflare Pages:** build command `npm run build`, output `dist`, `NODE_VERSION=24` (add `.nvmrc`). No `wrangler.toml` is needed for Pages git integration; add one only if it helps `npx wrangler pages dev dist` locally. Do not deploy.
13. **Docs:** `README.md` (local dev, build, icons, placeholders file, Cloudflare Pages setup, custom domain elinsoft.co.uk on the root, www → root 301 via a Cloudflare Redirect Rule or Bulk Redirect, `_headers`), `CLAUDE.md` (short: commands, architecture map, rules: placeholders only in links.ts, never another address than the registered office, no tracking), `AGENTS.md` (`@CLAUDE.md`), `.gitignore`.
14. **Company facts** (checked against the owner's Drive doc "Elinsoft – Company Facts", 2026-11-25): ELINSOFT LTD, company number 17597904, registered in England and Wales, registered office 128 City Road, London, EC1V 2NX, contact ashkan.sirous@gmail.com. No other address anywhere.
15. **Quality bar:** Lighthouse 90+ performance and accessibility on both pages (mobile preset); no horizontal scroll at 375px; colour contrast AA (check white text on #7B4DFF and pink, ink on sun, captions on each scene colour; darken text where needed, never the brand fills).

## Owner's brief (verbatim, 2026-11-25)

Build the website for my company ELINSOFT LTD: a static site deployed to Cloudflare Pages, with two pages:
- elinsoft.co.uk/       → company home page
- elinsoft.co.uk/dino   → "Dino: Kids Books & Stories" scroll-story page

Use Astro (static output) with plain CSS and a small amount of vanilla JS. No UI framework, no tracking or analytics scripts, no cookies. Share the header and footer between the two pages. It must work well on phones (test at 375px wide) and score 90+ on Lighthouse for performance and accessibility.

### Brand (follow exactly)
- Font: Fraunces from Google Fonts (weights 300 and 700) for headings and the logo; Inter (400/500/600/800) for body text.
- Colours: purple #7B4DFF (mark), pink #FF4FA3 (smiley), blue #2F6BFF (end dot), blush #FFE8F3 (main background), sun #FFC22E (accent), ink #14161B (text), off-white #FFFDF9 (page background). Extra tints: lilac #F3EDFF, aqua #E1F6FA, cream #FFF4DA, teal #0BA5C7.
- Mark (SVG, viewBox 0 0 64 64): a group rotated −10° around (32,32) containing a circle r=29 at (32,32) filled #7B4DFF, a white Fraunces Bold "E" (font-size 34, text-anchor middle, x=28 y=44) and a small #FFC22E circle r=4.5 at (47,40).
- Wordmark: "Elinsoft." with "Elin" in Fraunces 700 and "soft" in Fraunces 300, letter-spacing −0.02em, and a blue #2F6BFF full stop at the end. The dot on the "i" is a small drawn smiley, not an emoji: write the i as a dotless "ı" (U+0131) inside an inline-block span, with an absolutely positioned inline SVG (width/height 0.3em, centred above the letter) showing a pink circle with two white eyes and a white smile curve. Make the smiley's vertical position one CSS variable so I can fine-tune it.
- Make the mark and the wordmark reusable components. Also export favicon.svg, a 32px favicon PNG, a 180px apple-touch-icon and a 1200×630 Open Graph image (wordmark on the blush background).

### Home page (/)
1. Header: logo on the left; links on the right to Apps, Books, About, Contact (anchors on the page). The links wrap on mobile.
2. Hero on blush with a few soft coloured circles: H1 "Apps and stories for families." ("for families" in purple, blue full stop). Text: "Elinsoft is a small London studio making bedtime story apps, reading tools and children's books." Buttons: "Meet Dino" (→ /dino) and "All our apps" (→ #apps). The large mark on the right.
3. "Our apps." — two cards:
   - Dino: Kids Books & Stories (lilac card, links to /dino): "Bedtime tales in your voice. Picture books read aloud, with recordings from your own family." Platforms: iPhone & iPad · Android · Windows · Sonos.
   - Read The Stupid Text (aqua card): "Reads any text out loud — on screen, or from a photo. Natural voices that work fully offline." Buttons: "Get it from Microsoft", "Get it on Google Play".
4. Dino teaser: a purple rounded panel with "FEATURED APP", the heading "Dino: Kids Books & Stories", "Bedtime Tales in Your Voice", store buttons (App Store, Google Play, Microsoft), a yellow "See how Dino works →" button to /dino, and "Also plays on Sonos speakers. Alexa coming soon."
5. "Our books." — "Little Seagull's Big Adventures — picture books for little readers." Three square cover tiles: X Marks the Treasure, Love from Seagull Island, Dino Reader books.
6. About (cream panel with a large pink smiley): "Elinsoft — short for Elin Software — was founded in London in 2026 by Ashkan Sirous, a software engineer with 17 years' experience. We build software and stories for families, starting with the ones we use at home."
7. Footer (ink background): wordmark, email ashkan.sirous@gmail.com, and the legal lines "ELINSOFT LTD · Registered in England and Wales", "Company number 17597904", "Registered office: 128 City Road, London, EC1V 2NX", and a link to /privacy. Never put any other address on the site.

### Dino page (/dino): scroll story
A pinned full-screen stage (position: sticky inside a tall track, about 6 screens tall). As the user scrolls, scroll progress drives six scenes. Use requestAnimationFrame and transforms/opacity only (no layout thrashing), and IntersectionObserver where it fits. No heavy libraries; GSAP ScrollTrigger is OK only if it clearly simplifies things.
A sticky top bar is always visible: the Dino mark and name on the left, a yellow "Get the app" button on the right (→ #get). Small progress dots on the right edge. "Scroll to start the story" hint at the bottom of scene 1.
Scenes (background colour transitions smoothly; captions fade and slide in on the right, the visual on the left; stacked on mobile):
1. Night #1B1530, glowing yellow moon, closed purple book with a smiley. "It's bedtime." / "The lights go down. The stories come out."
2. #2A1F4D, the book opens and a page turns with scroll. "A book opens." / "Illustrated picture books, page by page."
3. #3B2A6B, sound waves pulse from the book. "And it reads aloud." / "A warm voice for every page, every night."
4. Blush #FFE8F3, a pink "Grandma, recording" avatar with a microphone slides in and the waves turn pink. "Or in Grandma's voice." / "Record your family once — they read every night, from anywhere."
5. Aqua #E1F6FA, the book gives way to device outlines appearing one by one: iPhone, iPad, Windows laptop, Sonos speaker. "On every screen at home." / "iPhone, iPad, Android, Windows and Sonos."
6. Purple #7B4DFF: "Bedtime Tales in Your Voice." / "On screen, or as a real book on the shelf. Keep scrolling."
After the story:
- "See Dino in action." — a 16:9 trailer area. Use a lite YouTube embed (load the iframe only on click) with a placeholder poster and a yellow play button until I give you the video ID.
- #get section (purple): the mark, "Dino: Kids Books & Stories", "Bedtime Tales in Your Voice", the three store buttons, "Also plays on Sonos speakers. Alexa coming soon.", then a white card "Prefer real paper?" — "The same stories are printed as picture books you can hold, for bedtime without a screen." — with a "Buy the paperbacks" button. Finish with "Made by Elinsoft · ELINSOFT LTD, company number 17597904".
Accessibility: respect prefers-reduced-motion. In that case show the six scenes as a normal vertical page with no pinning or animation. All text must be real text (not inside images), with proper heading order and visible focus styles.

### Other pages
- /privacy: a simple privacy page for the website. It has no tracking or cookies; contact is the email above. Mark it clearly as a draft for me to review.
- 404 page in the brand style.

### Placeholders: put these in ONE config file (src/data/links.ts or similar) and list them for me at the end
- Dino store URLs: App Store, Google Play, Microsoft Store
- Read The Stupid Text store URLs: Microsoft Store, Google Play
- Amazon link for the paperbacks (until set, the button reads "Paperbacks coming soon" and is not a link)
- YouTube trailer ID
- Book cover images and app screenshots (use tinted placeholder tiles until provided)
Never invent store URLs, numbers, reviews or download counts.

### Deploy
- Set up for Cloudflare Pages (build command, output dir) with a short README covering local dev, the build and how to connect the custom domain elinsoft.co.uk (root) and www → root redirect.
- Add a _headers file with sensible security headers and long cache for hashed assets.
- Don't push or deploy anything until I've reviewed it locally. Commit to a local git repo only.

When done, run the build, check both pages at 375px and 1440px, and give me: the list of placeholders still to fill, and anything you weren't sure about.

## Work items
- [x] Scaffold Astro 7 project, config, tsconfig, .nvmrc, .gitignore
- [x] Brand tokens CSS, Mark, Wordmark, Layout, Header, Footer, StoreButtons
- [x] `src/data/links.ts` placeholders
- [x] Home page sections 1-7
- [x] /dino scroll story + trailer + #get
- [x] /privacy (draft banner), 404
- [x] Icon script + generated favicon.svg, favicon-32.png, apple-touch-icon.png, og.png
- [x] `public/_headers`
- [x] README, CLAUDE.md, AGENTS.md
- [x] `npm run build` and `astro check` clean

## Built

Files: `astro.config.mjs`, `package.json`, `tsconfig.json`, `.nvmrc`, `.gitignore`, `README.md`, `CLAUDE.md`, `AGENTS.md`; `src/data/links.ts`; `src/layouts/Layout.astro`; `src/components/` (`Mark`, `Wordmark`, `Smiley`, `DinoMark`, `Header`, `Footer`, `StoreButtons`, `story/` Book, Moon, Waves, Avatar, Devices); `src/styles/global.css` and `story.css`; `src/scripts/story.ts` and `trailer.ts`; `src/pages/` index, dino, privacy, 404; `public/_headers`, `public/story-boot.js` plus the four generated icons; `scripts/make-icons.mjs` and `scripts/fonts/` (Fraunces 72pt Bold and Light static TTFs from undercasetype/Fraunces, OFL.txt).

Judgment calls:
- Fraunces static TTFs come from the upstream undercasetype/Fraunces repo: google/fonts only ships the variable font.
- `public/story-boot.js` (a tiny external script in the head of /dino) adds `story--animated` to `<html>` before first paint, so there is no flash of the stacked layout; `story.ts` keeps the class in sync, including on preference change. The class is on `<html>`, not the track.
- The brief gives no Dino mark, so `DinoMark.astro` is a purple tile with an open book and the pink smiley; used in the /dino bar, trailer poster and #get.
- The About heading "About." and the 404/privacy copy are not in the brief; the privacy draft discloses Cloudflare hosting, Google Fonts and the YouTube click-through.
- The /dino stage pins 60px below the top (under the sticky bar) and is `100svh - 60px`, so the whole scene is visible; `story.ts` offsets progress by that pin distance.
- Book cover tiles are 2-up on phones, 3-up above that.
- The trailer poster is a local gradient (no `i.ytimg.com` request); the CSP still allows that host as the decision lists it.

Checks: `npm run build` clean (4 pages), `astro check` 0/0/0, `npm run icons` gives favicon-32 32x32, apple-touch-icon 180x180, og 1200x630. Lighthouse mobile (local preview, uncompressed): / perf 0.90 a11y 1.00; /dino 0.93 / 1.00; /privacy 0.93 / 1.00; /404 0.94 / 1.00. No horizontal overflow at 375px on all four pages. Reduced-motion emulation on /dino: six stacked scenes, stage `position: static`. Hosts contacted on load: self, fonts.googleapis.com, fonts.gstatic.com.

## Verification
- Build passes, `astro check` 0 errors.
- 375px and 1440px screenshots of /, /dino (several scroll positions), /privacy, 404; no horizontal overflow.
- Reduced-motion emulation on /dino shows six stacked scenes, no sticky.
- Lighthouse mobile: performance ≥ 90, accessibility ≥ 90 on / and /dino.
- No requests to any host but self and Google Fonts on load (YouTube only after clicking play, when an ID is set).

## Review
- Pass 1 (high): ../reviews/pass1-high.md. Fixed 1-8, 10. Skipped #9 (no ESLint/CI): out of scope for now, no remote yet; Cloudflare Pages git integration only.
- Pass 2 (medium): ../reviews/pass2-medium.md. Fixed 1, 3-10. Skipped #2 (two-column breakpoint 860px, not 768px): the brief only requires stacking on phones.
