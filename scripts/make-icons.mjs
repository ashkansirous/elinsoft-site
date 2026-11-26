// Generates the brand icons into public/: favicon.svg, favicon-32.png, apple-touch-icon.png, og.png, og-dino.png.
// Run with `npm run icons`. Outputs are committed, so this is a dev-only tool (opentype.js + resvg).
// The Fraunces glyphs are converted to SVG paths here, so no icon depends on a web font being installed.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import opentype from 'opentype.js';
import { Resvg } from '@resvg/resvg-js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const publicDir = join(root, 'public');

const COLORS = {
  purple: '#7B4DFF',
  pink: '#FF4FA3',
  blue: '#2F6BFF',
  blush: '#FFE8F3',
  sun: '#FFC22E',
  lilac: '#F3EDFF',
  aqua: '#E1F6FA',
  ink: '#14161B',
};

function loadFont(file) {
  const buf = readFileSync(join(here, 'fonts', file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

const bold = loadFont('Fraunces72pt-Bold.ttf');
const light = loadFont('Fraunces72pt-Light.ttf');

/** The mark's "E": Fraunces Bold, font-size 34, centred on x=28 with baseline y=44 (the brief's text element, as a path). */
function markLetterPath() {
  const size = 34;
  const width = bold.getAdvanceWidth('E', size);
  return bold.getPath('E', 28 - width / 2, 44, size).toPathData(2);
}

function markGroup() {
  return `<g transform="rotate(-10 32 32)">
    <circle cx="32" cy="32" r="29" fill="${COLORS.purple}"/>
    <path d="${markLetterPath()}" fill="#fff"/>
    <circle cx="47" cy="40" r="4.5" fill="${COLORS.sun}"/>
  </g>`;
}

function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  ${markGroup()}
</svg>
`;
}

function appleTouchSvg() {
  // 180x180, solid blush so there is no transparency; the mark fills about 73% of the tile.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect width="180" height="180" fill="${COLORS.blush}"/>
  <g transform="translate(90 90) scale(2.28) translate(-32 -32)">${markGroup()}</g>
</svg>
`;
}

function glyphAdvance(font, char, size) {
  return (font.charToGlyph(char).advanceWidth * size) / font.unitsPerEm;
}

/** Lays out "Elinsoft." as paths with the brand's -0.02em letter spacing, and returns the pieces plus the dotless i's box. */
function layoutWordmark(size, baseline) {
  const spacing = -0.02 * size;
  const runs = [
    { text: 'Elın', font: bold, fill: COLORS.ink },
    { text: 'soft', font: light, fill: COLORS.ink },
    { text: '.', font: bold, fill: COLORS.blue },
  ];
  const parts = [];
  let cursor = 0;
  let dotlessI = null;
  for (const run of runs) {
    for (const char of run.text) {
      const path = run.font.getPath(char, cursor, baseline, size);
      parts.push({ d: path.toPathData(2), fill: run.fill });
      if (char === 'ı') dotlessI = path.getBoundingBox();
      cursor += glyphAdvance(run.font, char, size) + spacing;
    }
  }
  return { parts, width: cursor - spacing, dotlessI };
}

function smileyGroup(cx, cy, diameter) {
  const scale = diameter / 32;
  return `<g transform="translate(${cx - diameter / 2} ${cy - diameter / 2}) scale(${scale})">
    <circle cx="16" cy="16" r="16" fill="${COLORS.pink}"/>
    <circle cx="11.2" cy="13.2" r="2.5" fill="#fff"/>
    <circle cx="20.8" cy="13.2" r="2.5" fill="#fff"/>
    <path d="M9.6 19.2Q16 25.8 22.4 19.2" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
  </g>`;
}

function ogSvg() {
  const size = 210;
  const baseline = 372;
  const { parts, width, dotlessI } = layoutWordmark(size, baseline);
  const offsetX = (1200 - width) / 2;
  const diameter = size * 0.3;
  const smileyX = offsetX + (dotlessI.x1 + dotlessI.x2) / 2;
  const smileyY = dotlessI.y1 - size * 0.045 - diameter / 2;
  const paths = parts.map((p) => `<path d="${p.d}" fill="${p.fill}"/>`).join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="${COLORS.blush}"/>
  <circle cx="1090" cy="70" r="190" fill="${COLORS.lilac}"/>
  <circle cx="90" cy="600" r="130" fill="${COLORS.aqua}"/>
  <circle cx="1010" cy="540" r="34" fill="${COLORS.sun}"/>
  <circle cx="170" cy="120" r="16" fill="${COLORS.pink}" fill-opacity="0.85"/>
  <g transform="translate(${offsetX} 0)">
    ${paths}
  </g>
  ${smileyGroup(smileyX, smileyY, diameter)}
</svg>
`;
}

/** Lays out one line of Fraunces Bold as a path with the brand's -0.02em letter spacing. */
function textPath(text, size, x, baseline, fill) {
  let cursor = x;
  const spacing = -0.02 * size;
  let d = '';
  for (const char of text) {
    d += bold.getPath(char, cursor, baseline, size).toPathData(2);
    cursor += glyphAdvance(bold, char, size) + spacing;
  }
  return `<path d="${d}" fill="${fill}"/>`;
}

function dataUri(file, mime) {
  return `data:${mime};base64,${readFileSync(join(root, 'src', 'assets', file)).toString('base64')}`;
}

/** /dino share picture: the real Dino icon and the real X Marks the Treasure! cover (embedded as data URIs) beside the app name. */
function ogDinoSvg() {
  const coverH = 450;
  const coverW = Math.round((coverH * 600) / 804);
  const coverX = 1200 - 80 - coverW;
  const coverY = (630 - coverH) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <clipPath id="icon"><rect x="80" y="90" width="190" height="190" rx="44"/></clipPath>
    <clipPath id="cover"><rect x="${coverX}" y="${coverY}" width="${coverW}" height="${coverH}" rx="14"/></clipPath>
  </defs>
  <rect width="1200" height="630" fill="${COLORS.blush}"/>
  <circle cx="1090" cy="70" r="190" fill="${COLORS.lilac}"/>
  <circle cx="90" cy="600" r="130" fill="${COLORS.aqua}"/>
  <circle cx="1010" cy="580" r="34" fill="${COLORS.sun}"/>
  <circle cx="400" cy="120" r="16" fill="${COLORS.pink}" fill-opacity="0.85"/>
  <image x="80" y="90" width="190" height="190" clip-path="url(#icon)" xlink:href="${dataUri('dino-icon.png', 'image/png')}"/>
  ${textPath('Dino:', 150, 74, 430, COLORS.ink)}
  ${textPath('Kids Books', 86, 78, 520, COLORS.purple)}
  ${textPath('& Stories', 86, 78, 600, COLORS.purple)}
  <image x="${coverX}" y="${coverY}" width="${coverW}" height="${coverH}" clip-path="url(#cover)" xlink:href="${dataUri('cover-x-marks-the-treasure.jpg', 'image/jpeg')}"/>
</svg>
`;
}

function renderPng(svg, width) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, 'favicon.svg'), faviconSvg());
writeFileSync(join(publicDir, 'favicon-32.png'), renderPng(faviconSvg(), 32));
writeFileSync(join(publicDir, 'apple-touch-icon.png'), renderPng(appleTouchSvg(), 180));
writeFileSync(join(publicDir, 'og.png'), renderPng(ogSvg(), 1200));
writeFileSync(join(publicDir, 'og-dino.png'), renderPng(ogDinoSvg(), 1200));
console.log('Icons written to public/');
