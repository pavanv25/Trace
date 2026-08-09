import { Hono } from 'hono';

export const collectRoute = new Hono();

// Phase 3: validate API key, parse user agent, geolocate IP, write to DB
collectRoute.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: 'Invalid body' }, 400);

  console.log('[collect]', JSON.stringify(body));
  return c.json({ ok: true });
});
