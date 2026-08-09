import { Hono } from 'hono';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export const trackerRoute = new Hono();

const NOT_BUILT = '// Tracker not built. Run: pnpm --filter @trace/tracker build';
let _cached: string | null = null;

function loadScript(): string {
  if (_cached !== null) return _cached;
  try {
    const path = resolve(process.cwd(), '../../packages/tracker/dist/tracker.js');
    _cached = readFileSync(path, 'utf-8');
  } catch {
    // Cache the error stub so we don't hit the FS on every request
    _cached = NOT_BUILT;
    console.error('[tracker] dist/tracker.js not found — run: pnpm --filter @trace/tracker build');
  }
  return _cached;
}

// Eagerly load at startup so failures surface immediately
loadScript();

trackerRoute.get('/', (c) => {
  const script = loadScript();
  const status = script === NOT_BUILT ? 503 : 200;
  return c.text(script, status, {
    'Content-Type': 'application/javascript; charset=utf-8',
    'Cache-Control': status === 200 ? 'public, max-age=3600' : 'no-store',
  });
});
