import { gaMeasurementId } from '../data/links';
import { evaluateGate } from './analytics-gate';

const STORAGE_KEY = 'elinsoft-analytics-consent';
const GTAG_SRC = 'https://www.googletagmanager.com/gtag/js?id=';
const COOKIE_DOMAINS = ['elinsoft.co.uk', '.elinsoft.co.uk'];

type Choice = 'granted' | 'denied';
type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

let gtagLoaded = false;

function readChoice(): Choice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Returns false when storage is unavailable: the choice then only applies to this page view. */
function storeChoice(choice: Choice): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
    return true;
  } catch {
    return false;
  }
}

/** Google's documented opt-out switch: while true, gtag.js sends nothing. */
function setGaDisabled(disabled: boolean): void {
  (window as unknown as Record<string, unknown>)['ga-disable-' + gaMeasurementId] = disabled;
}

function defineGtag(): (...args: unknown[]) => void {
  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function gtag() {
      // gtag.js reads `arguments` objects from the data layer, not arrays.
      w.dataLayer!.push(arguments);
    };
  }
  return w.gtag;
}

/** Sets up consent, then loads Google's script once. Only called after "granted" and only when the gate counts the visit. */
function loadGoogleTag(): void {
  if (gtagLoaded) return;
  const gate = evaluateGate({
    hostname: location.hostname,
    webdriver: navigator.webdriver === true,
    prod: import.meta.env.PROD,
  });
  if (!gate.counted) {
    console.debug(`[analytics] not sent: ${gate.reason}`);
    return;
  }
  gtagLoaded = true;
  const gtag = defineGtag();
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  });
  gtag('consent', 'update', { analytics_storage: 'granted' });
  gtag('js', new Date());
  gtag('config', gaMeasurementId);
  const script = document.createElement('script');
  script.async = true;
  script.src = GTAG_SRC + gaMeasurementId;
  document.head.appendChild(script);
  console.debug('[analytics] gtag.js requested');
}

function deleteGaCookies(): void {
  const names = document.cookie
    .split(';')
    .map((part) => part.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_'));
  for (const name of names) {
    const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = expired;
    for (const domain of COOKIE_DOMAINS) document.cookie = `${expired}; domain=${domain}`;
  }
}

/** Page effects of Accept, without touching storage. Loading still goes through the gate. */
function applyAccept(): void {
  setGaDisabled(false);
  const gtag = (window as GtagWindow).gtag;
  if (gtagLoaded && gtag) gtag('consent', 'update', { analytics_storage: 'granted' });
  else loadGoogleTag();
}

/** Page effects of Reject, without touching storage. */
function applyReject(): void {
  setGaDisabled(true);
  const gtag = (window as GtagWindow).gtag;
  if (gtagLoaded && gtag) gtag('consent', 'update', { analytics_storage: 'denied' });
  deleteGaCookies();
}

function accept(): void {
  // Decision 5: if the choice cannot be stored, do not load gtag; the choice only applies to this page view.
  if (!storeChoice('granted')) return;
  applyAccept();
}

function reject(): void {
  if (!storeChoice('denied')) {
    // A stored 'granted' must not survive a Reject, or the next page would load gtag again.
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage is unusable; nothing more can be cleared.
    }
  }
  applyReject();
}

function isLocalStorageEvent(event: StorageEvent): boolean {
  try {
    return event.storageArea === localStorage;
  } catch {
    return false;
  }
}

/** Applies a choice made in another tab: only 'granted' accepts (through the gate); anything else rejects. Then onChoice hides this tab's banner. */
function onStorageChange(event: StorageEvent, onChoice: () => void): void {
  if (!isLocalStorageEvent(event)) return;
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  if (event.key !== null && event.newValue === 'granted') applyAccept();
  else applyReject();
  onChoice();
}

/** Keeps the page bottom clear of the fixed banner while it is visible (a class plus a CSSOM custom property). */
function syncBannerClearance(banner: HTMLElement): void {
  const visible = !banner.hidden;
  document.body.classList.toggle('has-consent-banner', visible);
  const height = visible ? banner.offsetHeight + 24 : 0;
  document.documentElement.style.setProperty('--consent-banner-height', `${height}px`);
}

export function initConsent(): void {
  const banner = document.getElementById('consent-banner');
  if (!banner) return;

  let opener: HTMLElement | null = null;
  const sync = (): void => syncBannerClearance(banner);

  const show = (event?: Event): void => {
    opener = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    banner.hidden = false;
    if (event) banner.focus();
    sync();
  };
  const hide = (): void => {
    const hadFocus = banner.contains(document.activeElement);
    banner.hidden = true;
    sync();
    if (!hadFocus) return;
    (opener ?? document.getElementById('main'))?.focus();
    opener = null;
  };

  banner.querySelector('[data-consent="accept"]')?.addEventListener('click', () => {
    accept();
    hide();
  });
  banner.querySelector('[data-consent="reject"]')?.addEventListener('click', () => {
    reject();
    hide();
  });
  document.querySelectorAll('[data-cookie-settings]').forEach((el) => el.addEventListener('click', show));
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(sync).observe(banner);
  window.addEventListener('storage', (event) => onStorageChange(event, hide));
  window.addEventListener('pageshow', (event) => {
    // A page restored from the back/forward cache missed any storage event; re-check the stored choice.
    if (event.persisted) syncToStoredChoice(show, hide);
  });

  syncToStoredChoice(show, hide);
}

/** Makes the page match the stored choice. Used at init and on a bfcache restore; safe to call repeatedly. */
function syncToStoredChoice(show: () => void, hide: () => void): void {
  const choice = readChoice();
  if (choice === 'granted') {
    applyAccept();
    hide();
  } else if (choice === 'denied') {
    applyReject();
    hide();
  } else {
    // No choice yet: stay silent until one is made.
    if (gtagLoaded) setGaDisabled(true);
    show();
  }
}
