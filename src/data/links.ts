/**
 * Every value the owner still has to supply lives here, and only here.
 * `null` means "not set yet": the UI shows a clearly disabled "coming soon"
 * state for it. Never put a guessed URL, rating or number in this file.
 */

export type Url = string | null;

export interface DinoStores {
  appStore: Url;
  googlePlay: Url;
  microsoftStore: Url;
}

export interface RtstStores {
  microsoftStore: Url;
  googlePlay: Url;
}

// Store links read from the ReadTheStupidText repo (site/dino/index.html, site/index.html) and each checked to return HTTP 200 on 2026-11-26.
export const dinoStores: DinoStores = {
  appStore: 'https://apps.apple.com/app/id6825053435',
  googlePlay: 'https://play.google.com/store/apps/details?id=uk.sirous.dinoreader',
  microsoftStore: 'https://apps.microsoft.com/detail/9N9VHRLCZXN5',
};

export const rtstStores: RtstStores = {
  microsoftStore: 'https://apps.microsoft.com/detail/9NGT1BN1H92V',
  googlePlay: 'https://play.google.com/store/apps/details?id=uk.sirous.readthestupidtext',
};

// TODO(owner): Amazon link for the Dino paperbacks. No title is on Amazon yet (the KDP drafts are not saved), so there is no link to read. Until set, the button reads "Paperbacks coming soon" and is not a link.
export const paperbacksUrl: Url = null;

// TODO(owner): YouTube video ID of the Dino trailer (only the ID, for example "abc123XYZ_-", not the full URL). No trailer video is uploaded yet; until then the poster says "Trailer coming soon".
export const trailerYouTubeId: string | null = null;

/** Company facts (checked against the owner's "Company Facts" doc). No other address may appear on the site. */
export const company = {
  name: 'ELINSOFT LTD',
  number: '17597904',
  jurisdiction: 'England and Wales',
  registeredOffice: '128 City Road, London, EC1V 2NX',
  email: 'elinsoftuk@gmail.com',
} as const;
