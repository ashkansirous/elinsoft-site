/**
 * Every real picture the site shows, imported once from src/assets (Astro optimises each one) and paired with its alt
 * text. The source path of each file in the ReadTheStupidText repo is listed in docs/plan/slices/02-real-content.md.
 */
import type { ImageMetadata } from 'astro';
import dinoIcon from '../assets/dino-icon.png';
import rtstIcon from '../assets/rtst-icon.png';
import coverXMarks from '../assets/cover-x-marks-the-treasure.jpg';
import coverSeagull from '../assets/cover-love-from-seagull-island.jpg';
import coverFreddy from '../assets/cover-freddy-and-the-slipper.jpg';
import page1 from '../assets/xmarks-page-1.jpg';
import page2 from '../assets/xmarks-page-2.jpg';
import page3 from '../assets/xmarks-page-3.jpg';
import backCover from '../assets/xmarks-back-cover.jpg';
import spread from '../assets/xmarks-spread.jpg';
import phoneRecord from '../assets/dino-phone-record.jpg';
import phonePicture from '../assets/dino-phone-picture.jpg';
import ipadShelf from '../assets/dino-ipad-shelf.jpg';
import windowsReading from '../assets/dino-windows-reading.jpg';

export interface Art {
  src: ImageMetadata;
  alt: string;
}

export interface BookCover extends Art {
  title: string;
  tint: 'cream' | 'aqua' | 'lilac' | 'blush';
}

export const dinoIconArt: Art = {
  src: dinoIcon,
  alt: 'Dino, a smiling green dinosaur with round glasses and an orange crest, holding a blue book, on a pink background',
};

export const rtstIconArt: Art = {
  src: rtstIcon,
  alt: 'Read The Stupid Text app icon: white reading glasses on a blue background',
};

export const bookCovers: BookCover[] = [
  {
    title: 'X Marks the Treasure',
    src: coverXMarks,
    alt: 'Cover of X Marks the Treasure: Captain Kathryn holding a treasure map on her ship, with Pancake Polly, Izzy and Billy beside her and Seagull on her hat',
    tint: 'cream',
  },
  {
    title: 'Love from Seagull Island',
    src: coverSeagull,
    alt: 'Cover of Love from Seagull Island: Captain Kathryn and Pancake Polly on the deck of the pirate ship, with a family of three seagulls in front of them and the harbour behind',
    tint: 'aqua',
  },
  {
    title: 'Freddy and the Slipper',
    src: coverFreddy,
    alt: 'Cover of Freddy and the Slipper: a fox in a striped jumper holding up an old slipper in a sunny meadow',
    tint: 'lilac',
  },
];

/** The book in scenes 2 and 3: its cover, then two pages turning, with `reading` the page the narration clip reads. */
export const storyBook = {
  cover: {
    src: coverXMarks,
    alt: 'X Marks the Treasure: Captain Kathryn holding a treasure map on her ship, with Pancake Polly, Izzy and Billy beside her and Seagull on her hat',
  } satisfies Art,
  /** The inside of the open cover (the real back cover): decorative, so the cover's alt is the only one read for it. */
  inside: {
    src: backCover,
    alt: '',
  } satisfies Art,
  turnFront: {
    src: page1,
    alt: 'A seagull flying over the harbour above Captain Kathryn, who runs along the quay holding a rolled-up map',
  } satisfies Art,
  turnBack: {
    src: page2,
    alt: 'Captain Kathryn holds up the treasure map on the quay while Seagull lands on her pirate hat',
  } satisfies Art,
  reading: {
    src: page3,
    alt: 'Captain Kathryn waves from the ship with Seagull on her hat as Izzy, Pancake Polly and Billy come running across the deck',
  } satisfies Art,
};

export const trailerPoster: Art = {
  src: spread,
  alt: 'Two pages of X Marks the Treasure side by side: Kathryn with the map in the harbour, and her crew on the ship',
};

export const deviceShots = {
  phoneRecord: {
    src: phoneRecord,
    alt: 'The Dino record-your-voice screen: tick who will record (Storyteller, Pip, Pop, Pim, Wolf) and a Start recording button',
  } satisfies Art,
  iphone: {
    src: phonePicture,
    alt: 'Dino on a phone: The Three Little Pigs, with a picture of three little pigs on a country path, the highlighted words and a play button',
  } satisfies Art,
  ipad: {
    src: ipadShelf,
    alt: 'Dino on a tablet: the Books shelf, a grid of picture-book covers, with a menu down the left side',
  } satisfies Art,
  windows: {
    src: windowsReading,
    alt: 'Dino on Windows: The Three Little Pigs, with its picture on the left, the words on the right with the first sentence highlighted, and a pause button',
  } satisfies Art,
};
