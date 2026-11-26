# elinsoft-site

Website for ELINSOFT LTD at **elinsoft.co.uk**. Astro 7 (static output), plain CSS, a little vanilla TypeScript. No tracking, no cookies.

Pages: `/` (company home), `/dino` (Dino scroll story), `/privacy` (draft), and a 404.

## Local development

Needs Node 24 (`.nvmrc`).

```sh
npm ci
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run preview    # serve dist/ locally
npx astro check    # type and template check
```

Pages build to `index.html`, `dino.html`, `privacy.html` and `404.html` (`build.format: 'file'`), so the Worker serves `/dino` and `/privacy` without a trailing slash.

## Placeholders to fill

Everything still missing is in **`src/data/links.ts`**, each marked `TODO(owner)`:

- Dino store URLs: App Store, Google Play, Microsoft Store
- Read The Stupid Text store URLs: Microsoft Store, Google Play
- Amazon link for the paperbacks (until set the button says "Paperbacks coming soon" and is not a link)
- YouTube trailer ID (until set the trailer area shows "Trailer coming soon")
- Book cover images (`public/` path) and app screenshots

A store with no URL shows a muted "Coming soon" button, never a dead link.

## Icons

`npm run icons` rebuilds `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` and `og.png`. It turns the Fraunces "E" and the wordmark into SVG paths (`opentype.js`) and rasterises them (`@resvg/resvg-js`), using the font files in `scripts/fonts/` (SIL Open Font Licence, `OFL.txt` alongside). Both packages are dev dependencies; the outputs are committed.

To move the smiley on the "i" of the wordmark, set `--smiley-y` (and `--smiley-size`) on the wordmark or any parent; see `src/components/Wordmark.astro`.

## Deploy: Cloudflare Worker (static assets) via Workers Builds

The site is the static-assets-only Worker `elinsoft-site` (`wrangler.jsonc`). Cloudflare Workers Builds is connected to this repository: every merge to `main` runs `npm run build` then `npx wrangler deploy`. Never deploy from a shell.

- `wrangler.jsonc` serves `dist/` and uses `404.html` for unknown paths; the default `html_handling` (`auto-trailing-slash`) serves `dino.html` at `/dino`. `workers_dev` and `preview_urls` are off on purpose, so the site lives only on its own domain.
- Custom Domains `elinsoft.co.uk` and `www.elinsoft.co.uk` are declared in `wrangler.jsonc`; the deploy creates their DNS records.
- `www` to root: the Single Redirect rule "www to elinsoft.co.uk" in the zone matches `http.host eq "www.elinsoft.co.uk"` and sends a 301 to `concat("https://elinsoft.co.uk", http.request.uri.path)` with the query string kept (rules run before the Worker).
- Node version for the build comes from `.nvmrc` (24).
- Check a config change without deploying: `npm run build && npx wrangler deploy --dry-run`.

`public/_headers` ships the security headers (CSP, HSTS, `nosniff`, referrer policy, frame denial, permissions policy), a long immutable cache for the hashed files in `/_astro/*`, and a revalidating cache for HTML. The CSP allows only this site, Google Fonts (stylesheet and font files) and youtube-nocookie.com frames; if you add a new third-party host, add it there too.
