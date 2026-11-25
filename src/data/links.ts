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

export interface BookCover {
  title: string;
  /** Path under /public (for example "/covers/x-marks.jpg"), or null for a tinted placeholder tile. */
  image: Url;
  /** Accessible description of the cover when an image is set. */
  alt: string;
  tint: 'cream' | 'aqua' | 'lilac' | 'blush';
}

export const dinoStores: DinoStores = {
  // TODO(owner): Dino on the App Store (iPhone and iPad).
  appStore: null,
  // TODO(owner): Dino on Google Play.
  googlePlay: null,
  // TODO(owner): Dino on the Microsoft Store.
  microsoftStore: null,
};

export const rtstStores: RtstStores = {
  // TODO(owner): Read The Stupid Text on the Microsoft Store.
  microsoftStore: null,
  // TODO(owner): Read The Stupid Text on Google Play.
  googlePlay: null,
};

// TODO(owner): Amazon link for the Dino paperbacks. Until set, the button reads "Paperbacks coming soon" and is not a link.
export const paperbacksUrl: Url = null;

// TODO(owner): YouTube video ID of the Dino trailer (only the ID, for example "abc123XYZ_-", not the full URL).
export const trailerYouTubeId: string | null = null;

export const bookCovers: BookCover[] = [
  {
    title: 'X Marks the Treasure',
    // TODO(owner): cover image for X Marks the Treasure.
    image: null,
    alt: 'Cover of X Marks the Treasure',
    tint: 'cream',
  },
  {
    title: 'Love from Seagull Island',
    // TODO(owner): cover image for Love from Seagull Island.
    image: null,
    alt: 'Cover of Love from Seagull Island',
    tint: 'aqua',
  },
  {
    title: 'Dino Reader books',
    // TODO(owner): cover image for the Dino Reader books.
    image: null,
    alt: 'Cover of the Dino Reader books',
    tint: 'lilac',
  },
];

// TODO(owner): app screenshots (Dino and Read The Stupid Text). Nothing on the site uses them yet; add the paths here
// and wire them into the card components when they are provided.
export const appScreenshots: { dino: Url[]; rtst: Url[] } = {
  dino: [],
  rtst: [],
};

/** Company facts (checked against the owner's "Company Facts" doc). No other address may appear on the site. */
export const company = {
  name: 'ELINSOFT LTD',
  number: '17597904',
  jurisdiction: 'England and Wales',
  registeredOffice: '128 City Road, London, EC1V 2NX',
  email: 'ashkan.sirous@gmail.com',
} as const;
