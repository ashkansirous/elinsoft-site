# Slice 4: Google Analytics 4 with consent

**Status:** in progress (branch `feat/analytics`)
**Touches:** `src/layouts/Layout.astro`, `src/components/ConsentBanner.astro` (new), `src/components/Footer.astro`, `src/scripts/analytics.ts` (new), `src/scripts/analytics-gate.ts` (new), `tests/analytics-gate.test.ts` (new), `package.json` (a `test` script), `src/data/links.ts` (measurement ID constant), `src/pages/privacy.astro`, `public/_headers`, this file.

## Owner's brief (2026-11-26, pasted verbatim; it ends mid-sentence)

> Add Google Analytics 4 to the elinsoft.co.uk website, in a way that is compliant with UK GDPR / PECR.
>
> Context
> - GA4 measurement ID: G-RC7G1W7KSS (property "elinsoft.co.uk", web stream "Elinsoft website").
> - Company: ELINSOFT LTD (UK). Keep it lightweight — no heavy third-party consent platforms unless the stack already has one.
>
> What to do
> 1. Work out the site's stack and where the shared <head>/layout lives, so the tag ends up on every page (including any app/product pages, e.g. Dino and Read The Stupid Text pages). Tell me what you found before changing anything big.
> 2. Add the Google tag (gtag.js) for G-RC7G1W7KSS in the shared head, using Google Consent Mode v2:
>    - Before the gtag config, set defaults to denied:
>      gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
>    - Then gtag('js', new Date()); gtag('config','G-RC7G1W7KSS');
> 3. Add a small, accessible cookie consent banner (plain HTML/CSS/JS, matching the site's existing style):
>    - "Accept analytics" and "Reject" buttons with equal prominence; no pre-ticked choices.
>    - On accept: gtag('consent','update',{analytics_storage:'granted'}) — leave all ad_* as denied (we don't run ads).
>    - Remember the choice in localStorage (wrap in try/catch); re-apply it on each page load; don't show the banner again once chosen.
>    - Add a "Cookie settings" link in the footer that reopens the banner so people can change their mind.
> 4. Add or update a short privacy/cookie section (or page) stating we use Google Analytics only with consent, what it collects, and contact email ashkan.sirous@gmail.com. Use the company name ELINSOFT LTD and registered office 128 City Road, London, EC1V 2NX — never a home address.
> 5. If the site sets a Content-Security-Policy (e.g. Cloudflare _headers, meta tag, or server config), allow https://www.googletagmanager.com and https://*.google-analytics.com / https://*.analytics.google.com as needed.
> 6. Don't track on localhost/preview builds if that's easy to detect (e.g. only load when location.hostname is elinsoft.co.uk or www.elinsoft.co.uk).
>
> Verify
> - Build and run the site locally; confirm the banner appears, Reject sends no GA hits, and Accept

Findings reported to the owner before building (step 1): Astro 7 static site; one shared head (`src/layouts/Layout.astro`) and footer (`src/components/Footer.astro`) on all four pages; Read The Stupid Text has no page of its own (a card on the home page); the CSP in `public/_headers` blocks inline scripts, so the consent defaults live in an external script. Owner answered "ok" (2026-11-26) to the recommendation below.

## Decisions

1. **This overrides the old rule** "No tracking, analytics or cookies" (CLAUDE.md, privacy page). The new rule: Google Analytics only after consent; no ads; nothing else.
2. **Google's script loads only after Accept** (owner "ok" to the recommendation, 2026-11-26), so Reject (or no choice) sends nothing to Google. On every page load with a stored "granted" choice, and right after Accept: define `dataLayer`/`gtag`, run the brief's `consent default` (all denied, `wait_for_update: 500`), then `consent update {analytics_storage:'granted'}` (ad_* stay denied), then `gtag('js', new Date())`, `gtag('config','G-RC7G1W7KSS')`, then insert `https://www.googletagmanager.com/gtag/js?id=G-RC7G1W7KSS` as an external `<script async>` created from script (no inline script).
3. **Production-only gate** (`analytics-gate.ts`, a pure function, unit-tested with `node --test`): counted only when all hold, else not counted with a reason: host is exactly `elinsoft.co.uk` or `www.elinsoft.co.uk`; `navigator.webdriver` is not true; `import.meta.env.PROD`. Any exception means not counted. When not counted, Accept still stores the choice and the banner behaves the same, but gtag.js is not loaded; it logs `console.debug('[analytics] not sent: <reason>')`.
4. **Banner** (`ConsentBanner.astro` in Layout, on every page): hidden by default in markup (`hidden`), shown by script only when no choice is stored. A labelled region (`role="region"`, `aria-label="Cookie choices"`), not a modal, no focus trap; one sentence plus a link to `/privacy`; two buttons "Accept analytics" and "Reject" with identical styling and size; nothing pre-selected. Matches the site's tokens in `global.css` (pill buttons, ink/pink); fits at 375 px without covering the page header; no layout shift of page content (fixed at the bottom). Without JS it never shows (and nothing loads).
5. **Storage:** `localStorage` key `elinsoft-analytics-consent`, values `granted` or `denied`, every access in try/catch (if storage fails, treat as no choice and do not load).
6. **Changing your mind:** a footer "Cookie settings" control (a `<button>` styled as a footer link, since it acts rather than navigates) reopens the banner and moves focus to it. Choosing Reject after Accept stores `denied`, calls `gtag('consent','update',{analytics_storage:'denied'})` if gtag is loaded, and deletes the `_ga` and `_ga_*` cookies on `elinsoft.co.uk` / `.elinsoft.co.uk`.
7. **CSP** (`public/_headers`): `script-src` adds `https://www.googletagmanager.com`; `connect-src` adds `https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com`; `img-src` adds `https://*.google-analytics.com https://www.googletagmanager.com`. Nothing else changes; still no `unsafe-inline`.
8. **Measurement ID** lives once, as a constant in `src/data/links.ts`.
9. **Privacy page:** replace "No tracking, no analytics" and "sets no cookies" with: Google Analytics runs only if you press "Accept analytics"; what it collects (pages viewed, how you arrived, device and browser type, approximate location derived from your IP address, time on page); the `_ga` / `_ga_*` cookies it sets (up to 2 years) and that Google acts as our processor and may process data outside the UK; how to change your mind (the Cookie settings control); lawful basis is consent. Update the meta description and the "Last updated" date. Keep the Draft note. Do not state a data retention period (it is a GA property setting no tool here can read; recorded under Open points).
10. **Contact email: elinsoftuk@gmail.com** (the site's `company.email`). The brief named the owner's personal address; the owner settled it (2026-11-26): "all emails go to elinsoft".
11. No copy, layout or colour change beyond the banner, the footer control and the privacy text.

## Open points

- GA4 data retention period and Google signals setting: not readable from here; the privacy page states neither.

## Built

- `src/scripts/analytics-gate.ts` (pure gate, 8 `node --test` cases), `src/scripts/analytics.ts` (consent state, `applyAccept`/`applyReject`, gtag only after Accept, `ga-disable-<id>` on Reject, `_ga` cookie deletion, cross-tab `storage` listener, focus return, banner padding through a CSS custom property), `src/components/ConsentBanner.astro`, footer "Cookie settings" button, `gaMeasurementId` in `links.ts`, CSP hosts in `_headers`, privacy page section.
- CSP host list: Google's GA4 list (`*.googletagmanager.com` in script/img/connect, `*.google-analytics.com`, `*.analytics.google.com`); confirmed in the live Accept check.

## From review

- Pass 1 (high), reviews/pass11-ga-high.md: applied 1-8.
  - Skipped 9 (reviews/pass11-ga-high.md): "belongs to the update-docs index pass" (CLAUDE.md and README still say no tracking; done in the docs pass after merge).
- Pass 2 (medium), reviews/pass12-ga-medium.md: applied 1 (failed 'denied' write now removes the key) and 2 (storage listener).
  - Skipped 3 (reviews/pass12-ga-medium.md): "Accept with an unstorable choice returns early" which only happens with storage off; nothing loads, which is the safe side.
  - Skipped 4 (reviews/pass12-ga-medium.md): "Focus return depends on banner.contains" and only affects mouse users on Safari/Firefox, where focus was not in the banner anyway.
  - Skipped 5 (reviews/pass12-ga-medium.md): "A stored 'granted' never expires or re-prompts" which the brief does not ask for; Cookie settings lets people change it any time.
  - Skipped 6 (reviews/pass12-ga-medium.md): "Only the pure gate is tested" while the consent flows were checked in Playwright runs recorded below.
- Check pass, reviews/pass13-ga-check.md: applied 2 (any value other than 'granted' rejects), 3 (only localStorage events) and 4 (a choice from another tab hides this tab's banner).
  - Skipped 1 (reviews/pass13-ga-check.md): "If setItem('denied') and removeItem both throw" which needs removeItem to fail too; browsers throw on writes only when the quota is full, and removing a key frees space, so there is no realistic way to reach it.
  - Skipped 5 (reviews/pass13-ga-check.md): "accept() returns early when storage fails" which is pass12 item 3 again; nothing loads, the safe side.
- Check pass 2, reviews/pass14-ga-check.md: applied 1 (`pageshow` re-check after a back/forward restore) and 4 (stored 'denied' sets the ga-disable flag at load).
  - Skipped 2 (reviews/pass14-ga-check.md): "treated as Reject (safe) but the banner is hidden" which only happens when someone clears site data in another tab; the banner returns on the next page.
  - Skipped 3 (reviews/pass14-ga-check.md): "hides the banner even when the user opened it deliberately" because the choice was just made in the other tab, so this tab's banner has nothing left to ask.
- Check pass 3, reviews/pass15-ga-check.md: applied 1-4 as one change, `syncToStoredChoice()` used by init and by a back/forward restore (granted: accept through the gate; denied: reject; none: silence gtag and show the banner).
- Check pass 4, reviews/pass16-ga-check.md: no blocking finding.
  - Skipped 1 (reviews/pass16-ga-check.md): "it only sets ga-disable" which already stops every hit; the visitor has made no choice yet and the banner is showing, so their answer applies the full Accept or Reject.
  - Skipped 2 (reviews/pass16-ga-check.md): "Same root as pass13 item 1" which is skipped above for the same reason (needs removeItem to fail as well).

## Verification

Local (2026-11-26, `dist/` on `wrangler dev` with the real CSP, Google hosts blocked): `npm test` 8/8, build, `astro check` 0/0/0. At 375 and 1440 on `/`, `/dino`, `/privacy`: banner shows, equal buttons, no overflow; Reject stores `denied`, no Google request, hidden after reload; Accept on localhost logs `not sent: host`, no Google request; Cookie settings reopens and focuses. Same page at 375: Reject, reopen, Accept, Reject, Accept each gave the right stored choice, flag and padding. Two tabs: Reject in B sets A's `ga-disable` flag. Failing `setItem`: Reject leaves no 'granted'. No CSP error.

Planned:

- `npm test` (gate cases: production host, www, localhost, preview `*.workers.dev`, webdriver true, dev build, exception), `npm run build`, `npx astro check` 0/0/0.
- `dist/` served with `wrangler dev` (real CSP), Playwright at 375 and 1440 on `/`, `/dino`, `/privacy`: banner appears; Reject: no request to any Google analytics host, banner gone after reload; Accept on localhost: the gate's `not sent: host` debug line and still no Google request; Cookie settings reopens the banner; no CSP console error. Playwright also blocks `*google-analytics.com` and `googletagmanager.com` at the network layer.
- The Accept path that really loads gtag.js can only run on the production host; it is checked live after merge in a normal (non-automated) browser by the coordinator, reading the Network panel or the GA4 Realtime report.
