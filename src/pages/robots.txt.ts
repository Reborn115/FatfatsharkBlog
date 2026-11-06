import type { APIContext } from 'astro';

export function GET({ site }: APIContext) {
  const configured = site && site.hostname !== 'example.com';
  return new Response(`User-agent: *\nAllow: /\n${configured ? `\nSitemap: ${new URL('sitemap-index.xml', site).href}\n` : ''}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
