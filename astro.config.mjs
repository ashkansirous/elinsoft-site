// @ts-check
import { defineConfig } from 'astro/config';

// Static output for a Cloudflare static-assets Worker. `format: 'file'` builds dino.html so the
// page is served at /dino exactly (no trailing slash, no redirect).
export default defineConfig({
  site: 'https://elinsoft.co.uk',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    // External CSS only, so the CSP needs no 'unsafe-inline' for styles we ship.
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      // Keep bundled <script> tags external (no data: URL inlining) for the CSP.
      assetsInlineLimit: 0,
    },
  },
});
