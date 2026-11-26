# Slice 3: search and share metadata

**Status:** done
**Touches:** `src/layouts/Layout.astro`, `src/pages/*.astro`, `src/pages/sitemap.xml.ts` (new), `public/robots.txt` (new), `scripts/make-icons.mjs`, `public/og-dino.png` (new), `src/data/seo.ts` (new), `public/_headers` (only if needed), this file.

## Ask

Owner, 2026-11-26, after the audit below: "fix them all".

Audit of the live site (2026-11-26, read with curl): every page has a title, description, canonical, `lang="en-GB"`, one `h1`, Open Graph and Twitter tags with a 1200x630 image. Gaps:

1. No sitemap (`/sitemap.xml` and `/sitemap-index.xml` are 404) and `robots.txt` (Cloudflare's managed file, comments only) names none.
2. No structured data (JSON-LD) for the company or the apps.
3. `/dino` shares the same Elinsoft wordmark picture as every page.
4. No `og:image:alt` / `twitter:image:alt`.
5. Plain `http://` is served without a redirect to https (zone setting "Always Use HTTPS" is off). Done by the coordinator through the Cloudflare API, not in this branch. "Always Use HTTPS" was turned on in the Cloudflare dashboard on 2026-11-26 (the owner said "ok"; API tokens lack Zone Settings Edit). After that, `http://elinsoft.co.uk/dino` and `http://www.elinsoft.co.uk/privacy?x=1` answered 301 to https (checked with curl).

## Decisions

1. **Sitemap without a new dependency:** a static endpoint `src/pages/sitemap.xml.ts` lists `/`, `/dino`, `/privacy` (absolute URLs from `Astro.site`, no trailing slash, matching the canonicals). 404 is left out. No `lastmod` (we would have to invent it).
2. **robots.txt:** add `public/robots.txt` with `User-agent: *`, `Allow: /` and `Sitemap: https://elinsoft.co.uk/sitemap.xml`. Cloudflare's managed content-signals block may still be prepended at the edge; that is fine.
3. **JSON-LD** as `<script type="application/ld+json">` data blocks (not executed, so the CSP without `unsafe-inline` does not block them; check in the browser console that no CSP error appears). Data built in `src/data/seo.ts` from `company`, `dinoStores` and `rtstStores` in `src/data/links.ts`; never typed twice.
   - Every page: `Organization` with `name` "ELINSOFT LTD", `alternateName` "Elinsoft", `url`, `logo` (`/apple-touch-icon.png`, absolute), `email`, `address` (`PostalAddress` built from the registered office: `streetAddress` "128 City Road", `addressLocality` "London", `postalCode` "EC1V 2NX", `addressCountry` "GB"), `identifier` the company number. No other address, phone or social profile.
   - Home: also `WebSite` (name, url, publisher = the Organization by `@id`), and a `SoftwareApplication` for each app (Dino and Read The Stupid Text) with `name`, `url` (Dino: `https://elinsoft.co.uk/dino`), `operatingSystem` (only the platforms that have a non-null store link), `applicationCategory`, `publisher`, `sameAs` the non-null store links.
   - /dino: the Dino `SoftwareApplication` only (plus the Organization).
   - Never add `offers`, `aggregateRating`, reviews, prices or download counts: we have none (CLAUDE.md rule). A null store link is simply left out.
4. **Dino share picture:** `npm run icons` also writes `public/og-dino.png`, 1200x630, same pink background and accents as `og.png`. On it: the real Dino icon (`src/assets/dino-icon.png`) and the real X Marks the Treasure! cover (`src/assets/covers/` file used on the site), embedded into the SVG as data URIs, plus the words "Dino: Kids Books & Stories" in the site's display font. Keep under ~300 KB. `og.png` stays as is.
5. **Layout props:** `ogImage` (path, default `/og.png`) and `ogImageAlt` (default text describing `og.png`: "Elinsoft wordmark with a pink smiley on a pale pink background"). Layout writes `og:image:alt`, `twitter:image:alt` and `og:locale` `en_GB`. `/dino` passes `/og-dino.png` and an alt describing the real picture.
6. No copy, layout or colour change on any page.

## Built

- `src/data/seo.ts`: Organization, WebSite and the two app objects, built from `links.ts`; `ldJson()` escapes `<` as `<`; `postalAddress()` throws at build time unless the registered office has exactly 3 parts.
- `src/pages/sitemap.xml.ts`, `public/robots.txt`, Layout props `ogImage` / `ogImageAlt` / `jsonLd`, `og:locale`, image alt tags.
- `public/og-dino.png` (1200x630, 294 KB) from `npm run icons`: Dino icon, "Dino: Kids Books & Stories", X Marks the Treasure! cover.
- Judgement calls: `applicationCategory` EducationalApplication (Dino) and UtilitiesApplication (Read The Stupid Text); Read The Stupid Text's `url` is the home page (it has no page of its own); the 404 page carries the Organization block too.

## From review

- Pass 1 (high), `reviews/pass9-seo-high.md`: applied 1 (the `<` escape was a no-op), 3 (favicon.svg line endings), 5 (address guard). 
  - Skipped 2 (reviews/pass9-seo-high.md): "The slice Decisions say" so, Decision 3 chose it.
  - Skipped 4 (reviews/pass9-seo-high.md): "Fix in the update-docs index pass" (`npm run icons` also writes `og-dino.png`; Map line for `src/data/seo.ts`)
- Pass 2 (medium), `reviews/pass10-seo-medium.md`: four nits, none applied (empty fields only if every store link were null; hand-typed sitemap list; RTST url; no cache rule for sitemap/robots).

## Verification

Local (2026-11-26): `npm run build` and `npx astro check` 0/0/0; sitemap has the three URLs; JSON-LD parses on all four pages; `/dino` names `og-dino.png` with size and alt; `dist/` served by `wrangler dev` with the real CSP showed no console error or warning on `/` and `/dino`.

Live (2026-11-26): `sitemap.xml` lists the three URLs; `robots.txt` names it; JSON-LD parses (home: Organization, WebSite, 2 SoftwareApplication; /dino: Organization, SoftwareApplication; privacy: Organization); /dino serves `og-dino.png` 1200x630 with alt; `og:image:alt` on every page.

Planned (all done, see above):

- `npm run build`, `npx astro check` 0/0/0.
- Built `dist/`: `sitemap.xml` valid XML with exactly the three URLs; `robots.txt` present; every page's JSON-LD parses with `JSON.parse` and holds only the fields above; `/dino` head names `og-dino.png` with width and height.
- Browser (preview build): no CSP violation in the console on `/` and `/dino`.
- Look at `og-dino.png` (small copy) to check it shows the icon, the cover and the words, uncut.
- Live after merge: the same checks against https://elinsoft.co.uk, plus `http://elinsoft.co.uk/dino` answers 301 to https.
