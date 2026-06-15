import type { APIRoute } from 'astro';
import { buildSearchIndex } from '~/utils/blog';

// Prerendered at build time to /it/blog/search.json — the client fetches this
// once to power the inline blog search.
export const GET: APIRoute = async () => {
  const index = await buildSearchIndex('it');
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};
