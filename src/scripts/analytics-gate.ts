/** Hosts whose visits may be counted by Google Analytics. Everything else (localhost, previews) is never counted. */
export const PRODUCTION_HOSTS: readonly string[] = ['elinsoft.co.uk', 'www.elinsoft.co.uk'];

export interface GateInput {
  hostname: string;
  /** `navigator.webdriver`: true in automated browsers. */
  webdriver: boolean;
  /** `import.meta.env.PROD`: false in a dev build. */
  prod: boolean;
}

export type GateResult = { counted: true } | { counted: false; reason: string };

/** Pure gate: counted only on the production host, in a production build, in a non-automated browser. Any exception means not counted. */
export function evaluateGate(input: GateInput): GateResult {
  try {
    if (!PRODUCTION_HOSTS.includes(input.hostname)) return { counted: false, reason: 'host' };
    if (input.webdriver === true) return { counted: false, reason: 'webdriver' };
    if (input.prod !== true) return { counted: false, reason: 'dev build' };
    return { counted: true };
  } catch {
    return { counted: false, reason: 'error' };
  }
}
