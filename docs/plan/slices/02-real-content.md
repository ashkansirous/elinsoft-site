# Slice 2 — Real store links and real assets (icons, covers, book pages, screenshots, narration)

Source: owner, 2026-11-26, after the first deploy: "why the site is empty? you have all the links and books in their
projects. I gave you access". Slice 1 left every value `null` instead of reading the owner's own projects. Then, the
same night, the owner's asset brief (verbatim below), which this slice builds in full.

**Touches:** `src/data/links.ts`, `src/assets/**` (new), `src/pages/index.astro`, `src/pages/dino.astro`,
`src/components/**` (`DinoMark`, `StoreButtons` only if needed, `story/*`), `src/scripts/story.ts` (page turn between
real pages), `src/scripts/listen.ts` (new, tap-to-hear), `src/styles/global.css`, `src/styles/story.css`,
`public/audio/**` (new), `public/_headers`, `README.md`, `CLAUDE.md` (map line for `src/assets`),
`docs/plan/slices/02-real-content.md`.

## Owner's asset brief (2026-11-26, verbatim)

> The /dino page (and parts of the home page) use placeholder graphics: a purple box "book", a smiley, generic device
> outlines, empty cover tiles. Those were stand-ins from the design mock-up. Replace them with the REAL assets from my
> actual app and books. Keep the layout, scroll mechanics, copy and brand colours as they are; only swap the visuals.
>
> Where the real assets are
> - Dino app: the ReadTheStupidText repo, under src/Dino (app icon, the Dino character, UI, any store/marketing
>   screenshots). Check the repo's CLAUDE.md first.
> - Dino store books (covers, page illustrations, narration audio): find where the app loads them from (the catalogue /
>   CDN the app uses; the same book covers appear on dinoreader.sirous.uk/stats). Books include The Lion and the Mouse,
>   The Three Little Pigs, X Marks the Treasure!, The Gingerbread Man, Goldilocks and the Three Bears, Good Enough.
> - Seagull series (X Marks the Treasure, Love from Seagull Island): covers from the print-the-damn-book repo or the
>   book exports.
> - App store screenshots, if they're in either repo (fastlane, store-listing or similar folders).
> If you can't find something, stop and ask me rather than drawing a substitute.
>
> What goes where
> Dino page scroll story:
> 1. "It's bedtime": the real Dino character / app icon in the night scene (keep the moon).
> 2. "A book opens": a real book (use X Marks the Treasure! or The Lion and the Mouse): its real cover, then real page
>    spreads turning as you scroll.
> 3. "And it reads aloud": the same real page with the waves; optionally a small "tap to hear" button playing a 5-second
>    real narration clip (muted until tapped, no autoplay).
> 4. "Or in Grandma's voice": a real screenshot of the app's record-your-voice screen inside a phone frame.
> 5. "On every screen": real app screenshots inside the iPhone / iPad / Windows frames (Sonos can stay an outline with
>    the Dino icon).
> 6. Ending: real app icon; "Prefer real paper?" shows the real covers of the printed books.
> Trailer poster: a real screenshot or book spread until the video exists.
>
> Home page:
> - Dino card: real Dino app icon instead of the generic book icon.
> - Read The Stupid Text card: its real app icon.
> - "Our books": real covers for X Marks the Treasure, Love from Seagull Island, and a real Dino book cover for the
>   third tile.
> - Keep the Elinsoft logo as it is; that one is final.
>
> Rules
> - Copy assets into this repo (src/assets/...), don't hotlink from other domains.
> - Optimise images: AVIF/WebP with fallbacks, correct sizes per breakpoint, lazy-load everything below the first
>   screen, keep the page fast on mid-range Android.
> - Audio: small compressed clips only, never autoplay.
> - Alt text that describes the real picture.
> - Don't change copy, layout or colours beyond what's needed to fit the real images.
>
> When done: show me both pages at 375px and 1440px, list every asset you used with its source path, and list anything
> you couldn't find.

## Facts (read 2026-11-26 from ReadTheStupidText `origin/main`, R below)

Store links (R `site/dino/index.html`, `site/index.html`, Slice 417); each returned HTTP 200 on 2026-11-26; iTunes
lookup 6825053435 (GB) gives "Dino: Kids Books & Stories":

- Dino: App Store `https://apps.apple.com/app/id6825053435`, Google Play
  `https://play.google.com/store/apps/details?id=uk.sirous.dinoreader`, Microsoft Store `https://apps.microsoft.com/detail/9N9VHRLCZXN5`
- Read The Stupid Text: Microsoft Store `https://apps.microsoft.com/detail/9NGT1BN1H92V`, Google Play
  `https://play.google.com/store/apps/details?id=uk.sirous.readthestupidtext`

Assets (read with `git -C D:\ReadTheStupidText show origin/main:<path>`, never from the primary checkout's files):

- Dino app icon / character: R `src/Dino/DinoReader.App/Resources/Images/dino_icon.png` (512 x 512 RGBA).
- Read The Stupid Text app icon: R `src/Rtst/ReadTheStupidText.App/Assets/Square150x150Logo.scale-200.png` (300 x 300).
- Covers (896 x 1200, 3:4): R `content/dino/<stem>/cover.jpg` for `x-marks-the-treasure`, `love-from-seagull-island`,
  `freddy-and-the-slipper` (the third tile "Dino Reader books": Freddy is the first book of the "Dino Stories" KDP
  series, print-the-damn-book plan.md; the first KDP paperback). Page pictures: R `content/dino/x-marks-the-treasure/pictures/<n>.jpg`
  (the page text is in `story.md` / `book.json` of the same folder; `high-res/` files are Git LFS pointers, do not use).
- Narration: R `content/dino/x-marks-the-treasure/audio/en/*.m4a`, mapped to sentences by that folder's manifest
  (`audio/en/manifest.json` or `audio-cast.json`). The .m4a files are Git LFS: fetch one with
  `git -C D:\ReadTheStupidText show origin/main:<path> | git -C D:\ReadTheStupidText lfs smudge` (writes nothing into
  that checkout), or from the app's own catalogue `https://dinoreader.sirous.uk/api/stories`.
- Store screenshots (R `docs/store-listings/screenshots/dino/`): phone `phone/store-dino-phone-{1-picture,2-voices,3-record,5-shelf}.png`
  (1080 x 2400), iPad `ipad-13/store-dino-ipad-13-*.png`, Windows `windows/store-0N-*.png` (1920 x 1080). Read The Stupid
  Text phone `rtst/phone/store-rtst-phone-1-home.png`. Use the uncaptioned folders (not `*-captioned`).

Not found anywhere, so they stay `null` (checked 2026-11-26), and are not visuals:

- **Paperbacks Amazon link:** no title is on Amazon yet (print-the-damn-book Slice 38, the KDP robot, has not saved a
  first draft). The "Prefer real paper?" card shows the real covers; its button stays "Paperbacks coming soon".
- **Trailer YouTube ID:** no video uploaded (R Slice 435 not started, Slice 445 planned). Poster becomes a real book spread.

## Decisions

1. Links into `src/data/links.ts`; filled values lose their `TODO(owner)`; paperbacks and trailer comments name the
   reason above. Image imports live in `src/data/` or the components (the image *data* may move to an `assets.ts`
   next to `links.ts`); CLAUDE.md's rule "placeholders only in links.ts" stays true for the two that remain.
2. Every picture is copied into `src/assets/` and rendered through Astro's `<Picture>` (`astro:assets`) with
   `formats={['avif','webp']}` and a JPEG/PNG fallback, `widths` + `sizes` per breakpoint, explicit width/height,
   `loading="lazy"` + `decoding="async"` below the first screen, eager only for the first-screen picture of each page
   (the Dino icon in scene 1 on `/dino`). Sources are trimmed to at most 2x their largest display size before import.
3. **Home:** Dino card gets the real Dino icon in place of `DinoMark`'s generic book; RTST card gets its real icon; the
   Dino teaser panel and `#get` use the real Dino icon. "Our books" tiles stay square and show the whole cover
   (`object-fit: contain` on the tile tint) so no title is cut. The Elinsoft mark and wordmark are not touched.
4. **/dino scenes** (layout, copy, colours, scroll mechanics unchanged; only the visuals inside):
   1. Night: the real Dino icon with the existing moon (the purple smiley book goes).
   2. Book: the X Marks the Treasure! cover first, then real page pictures turning with scroll (the existing 3D page turn,
      now with real pages front and back; two or three spreads, picked from pages that read well small).
   3. Reads aloud: the same real page with the waves; a small "Tap to hear" button plays one real English narration clip of
      that page, about 5 s, AAC/M4A or Opus, under 100 KB, `preload="none"`, never autoplays; button shows playing state
      and can stop. Served from `public/audio/` (`media-src 'self'` added to the CSP).
   4. Grandma: the real record-your-voice screenshot (`store-dino-phone-3-record.png`) inside a phone frame; the pink
      avatar/microphone stays as the overlay only if it still fits, otherwise goes.
   5. Devices: iPhone frame shows a real phone screenshot, iPad frame a real iPad screenshot, the Windows laptop a real
      Windows screenshot; Sonos stays an outline with the Dino icon.
   6. Ending: the real Dino icon. `#get`'s "Prefer real paper?" card shows the three real covers (small, lazy).
   Trailer poster: a real book spread from X Marks the Treasure! (lazy), the play button stays, "Trailer coming soon".
   Reduced-motion / no-JS stacked layout shows the same real pictures.
5. Alt text describes what the picture shows (read it off the image, e.g. the shelf of books, the record screen), never
   "screenshot 1". Decorative duplicates get `alt=""`.
6. CSP stays without `unsafe-inline`; `img-src 'self' data:` covers Astro's output; add `media-src 'self'`.
   `_headers`: `/_astro/*` already immutable; `/audio/*` `public, max-age=86400`.
7. Lighthouse mobile stays 90+ performance on `/` and `/dino`; total image bytes on first load of `/dino` kept small
   (only scene 1's icon eager).
8. Company email (owner, 2026-11-26, verbatim: "also the email for elinsoft is elinsoftuk@gmail.com"): `company.email` is
   `elinsoftuk@gmail.com`; no other address of the old email remains in the site (the brief quote in Slice 1 is left as written).

## Work items

1. [x] `links.ts` store links (Decision 1).
2. [x] Copy and trim the assets into `src/assets/` (Decision 2), list each with its R source path in this file's *Built*.
3. [x] Home page swaps (Decision 3).
4. [x] /dino scenes 1-6, trailer poster, `#get` covers (Decision 4), stacked fallback included.
5. [x] Tap-to-hear clip and `listen.ts` (Decision 4.3), CSP `media-src`.
6. [x] `_headers`, README placeholder list (only paperbacks and trailer left), CLAUDE.md map line.
7. [x] `npm run build`, `npx astro check` 0/0.
8. [x] Company email (Decision 8): `company.email` in `src/data/links.ts`; the footer and `/privacy` read it from there.

## Verification

- Playwright at 375 and 1440 on `/` and `/dino` (several scroll positions, reduced motion): no horizontal overflow, every
  picture loads, no request to another host but Google Fonts, store links have the exact hrefs above, the clip plays
  only after a tap. Lighthouse mobile 90+ on both pages.
- After the Workers Builds deploy: the same on the live site.

Result 2026-11-26 (local preview, headless Chromium, after both review passes): all pass. `/` and `/dino` at 375 and
1440 no overflow, every visible picture loads, the five store hrefs exact, footer elinsoftuk@gmail.com; `/dino` scenes
1-6, trailer poster and `#get` covers show real pictures and the open book has no empty half; reduced motion stacks
33 loaded pictures; only localhost and Google Fonts requested, no audio before a tap; tap plays, second tap and
scrolling away stop. Lighthouse mobile: `/` performance 95, accessibility 100; `/dino` 96 / 100.

## Not yet verified

- [session] The live site after the Workers Builds deploy (run by this session after the merge).

## Built

All sources read with `git -C D:\ReadTheStupidText show origin/main:<path>` (R = ReadTheStupidText). Trimmed with `sharp`
(already installed as an Astro dependency, `node_modules/sharp`); Astro's `<Picture>` then makes AVIF/WebP + JPEG/PNG.

`src/assets/` (file: R source path):

- `dino-icon.png` (512 px): `src/Dino/DinoReader.App/Resources/Images/dino_icon.png`
- `rtst-icon.png` (192 px): `src/Rtst/ReadTheStupidText.App/Assets/Square150x150Logo.scale-200.png`
- `cover-x-marks-the-treasure.jpg`: `content/dino/x-marks-the-treasure/cover.jpg` (600 px wide)
- `cover-love-from-seagull-island.jpg`: `content/dino/love-from-seagull-island/cover.jpg`
- `cover-freddy-and-the-slipper.jpg`: `content/dino/freddy-and-the-slipper/cover.jpg`
- `xmarks-page-1.jpg`, `xmarks-page-2.jpg`, `xmarks-page-3.jpg`: `content/dino/x-marks-the-treasure/pictures/1.jpg`, `2.jpg`, `3.jpg` (600 px wide; 1 = turn front, 2 = turn back, 3 = the page shown in scenes 3-5)
- `xmarks-spread.jpg` (1200 x 804, trailer poster): `pictures/2.jpg` and `pictures/3.jpg` of the same folder, placed side by side
- `dino-phone-record.jpg`: `docs/store-listings/screenshots/dino/phone/store-dino-phone-3-record.png`
- `dino-phone-picture.jpg` (iPhone frame): `docs/store-listings/screenshots/dino/phone/store-dino-phone-1-picture.png`
- `dino-ipad-shelf.jpg`: `docs/store-listings/screenshots/dino/ipad-13/store-dino-ipad-13-5-shelf.png`
- `dino-windows-reading.jpg`: `docs/store-listings/screenshots/dino/windows/store-02-reading.png`

`public/audio/`:

- `x-marks-ahoy.m4a` (AAC, 5.97 s, 38 KB, not trimmed): `content/dino/x-marks-the-treasure/audio/en/d2bc1f4e4dcab6bf-Kore-gemini-tts-59fae1dd.m4a`
  (Kathryn: "Ahoy, pirates! Up with the sail! We're going to find the lost treasure!"; matched to page 3 by the text hash
  in the file name, sha256 of the piece text; fetched with `git show` piped to `git lfs smudge`).

Notes: the phone screenshots in `phone/` are Android-shaped, used in the iPhone frame as Slice 2 says. The old Sonos
outline keeps a Dino icon; the pink avatar/microphone overlay in scene 4 was dropped (does not fit beside a real screen).
The Dino mark on the trailer poster was dropped (the real spread is the poster). Nothing was missing; only the Amazon link
and trailer ID stay `null` (no source).

#### From review

- Review pass 1 (`reviews/pass5-content-high.md`): applied 1-6 (cover inside is the real back cover; narration stops when its scene goes inert or out of view or the page is hidden; alts rewritten from the pictures; scene-1 icon `fetchpriority="high"` and bar icon eager; tap-to-hear `aria-pressed`, loading and error states; Book DOM in reading order). Finding 4 in part: scene 3-5 art still loads at first paint in animated mode (all scenes share one sticky stage, so `loading="lazy"` defers nothing there), so Decision 7 is unmet for those pictures. Finding 7 is the caller's.
- Review pass 2 (`reviews/pass6-content-medium.md`): applied 1 (`listen.ts` keeps one state variable; a second tap while loading stops and resets, the loading timer is cleared before a new one and renders only while still loading), 2 (`aria-pressed` dropped; the visible label "Tap to hear" / "Stop" carries the state) and 4 (app-card icons `alt=""`, the app name is beside them). Skipped 3 (the bar icon is on the first screen, eager is right) and 5 (store link sources are recorded in this file's Facts).
- Check pass (`reviews/pass7-content-check.md`): applied 1 (a tap after a load error calls `audio.load()` before `play()`) and 2 (dead `.cover__title` rule removed); 3 left as is (a cancel inside 500 ms shows no loading state, by the 500 ms rule).
