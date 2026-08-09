import { Hono } from 'hono';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export const trackerRoute = new Hono();

let _cached: string | null = null;

function loadScript(): string {
  if (_cached) return _cached;
  const path = resolve(process.cwd(), '../../packages/tracker/dist/tracker.js');
  _cached = readFileSync(path, 'utf-8');
  return _cached;
}

trackerRoute.get('/', (c) => {
  try {
    const script = loadScript();
    return c.text(script, 200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    });
  } catch {
    return c.text(
      '// Tracker not built. Run: pnpm --filter @trace/tracker build',
      503,
      { 'Content-Type': 'application/javascript' }
    );
  }
});
