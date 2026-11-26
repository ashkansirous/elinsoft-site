import type { APIRoute } from 'astro';
import { sitemapPaths } from '../data/seo';

/** Absolute URLs, written exactly as the canonicals are (home keeps its slash, the others have none), and no lastmod: we have no real date to give. */
export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://elinsoft.co.uk');
  const urls = sitemapPaths
    .map((path) => `  <url><loc>${new URL(path, base).toString()}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
