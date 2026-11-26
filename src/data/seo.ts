/**
 * Structured data (JSON-LD) for every page, built from the facts in `links.ts` so nothing is typed twice.
 * Never add offers, ratings, reviews, prices or download counts: the site has none.
 */
import { company, dinoStores, rtstStores, type Url } from './links';

export const siteUrl = 'https://elinsoft.co.uk';

/** Pages listed in the sitemap, as paths. 404 is left out on purpose. */
export const sitemapPaths = ['/', '/dino', '/privacy'] as const;

const orgId = `${siteUrl}/#organization`;
const dinoAppId = `${siteUrl}/dino#app`;
const rtstAppId = `${siteUrl}/#read-the-stupid-text`;

/** The registered office, split from `company.registeredOffice` ("128 City Road, London, EC1V 2NX"). */
function postalAddress() {
  const parts = company.registeredOffice.split(',').map((part) => part.trim());
  if (parts.length !== 3 || parts.some((part) => part === '')) {
    throw new Error(`registeredOffice must be "street, locality, postcode"; got "${company.registeredOffice}"`);
  }
  const [streetAddress, addressLocality, postalCode] = parts;
  return { '@type': 'PostalAddress', streetAddress, addressLocality, postalCode, addressCountry: 'GB' };
}

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': orgId,
    name: company.name,
    alternateName: 'Elinsoft',
    url: `${siteUrl}/`,
    logo: `${siteUrl}/apple-touch-icon.png`,
    email: company.email,
    address: postalAddress(),
    identifier: company.number,
  };
}

export function webSiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Elinsoft',
    url: `${siteUrl}/`,
    publisher: { '@id': orgId },
  };
}

interface AppInput {
  id: string;
  name: string;
  url: string;
  category: string;
  /** Platform name paired with its store link; a null link drops the platform. */
  stores: [platform: string, link: Url][];
}

function softwareApplicationLd({ id, name, url, category, stores }: AppInput) {
  const live = stores.filter((entry): entry is [string, string] => entry[1] !== null);
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': id,
    name,
    url,
    operatingSystem: live.map(([platform]) => platform).join(', '),
    applicationCategory: category,
    publisher: { '@id': orgId },
    sameAs: live.map(([, link]) => link),
  };
}

export function dinoAppLd() {
  return softwareApplicationLd({
    id: dinoAppId,
    name: 'Dino: Kids Books & Stories',
    url: `${siteUrl}/dino`,
    category: 'EducationalApplication',
    stores: [
      ['iOS', dinoStores.appStore],
      ['Android', dinoStores.googlePlay],
      ['Windows', dinoStores.microsoftStore],
    ],
  });
}

export function rtstAppLd() {
  return softwareApplicationLd({
    id: rtstAppId,
    name: 'Read The Stupid Text',
    url: `${siteUrl}/`,
    category: 'UtilitiesApplication',
    stores: [
      ['Android', rtstStores.googlePlay],
      ['Windows', rtstStores.microsoftStore],
    ],
  });
}

/** Serialises JSON-LD for a `<script type="application/ld+json">`; `<` is escaped so the data can never close the tag. */
export function ldJson(value: object): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
