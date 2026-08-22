import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { projects, events } from '@trace/db';
import { db } from '../lib/db';
import { parseUA } from '../lib/ua';
import { geolocate } from '../lib/geo';

export const collectRoute = new Hono();

// 50 KB max — enough for any legitimate event payload
collectRoute.use('/', bodyLimit({ maxSize: 50 * 1024 }));

const MAX_STRING = 2048;
const MAX_PROPS_JSON = 4096;
const TIMESTAMP_DRIFT_MS = 24 * 60 * 60 * 1000; // ±24 h

function sanitizeString(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  return v.slice(0, MAX_STRING) || null;
}

function validateURL(v: unknown): string | null {
  const s = sanitizeString(v);
  if (!s) return null;
  try {
    const u = new URL(s);
    // Only allow http/https URLs
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return s;
  } catch {
    return null;
  }
}

function validateTimestamp(v: unknown): Date {
  if (typeof v === 'string') {
    const d = new Date(v);
    if (!isNaN(d.getTime())) {
      const drift = Math.abs(Date.now() - d.getTime());
      if (drift <= TIMESTAMP_DRIFT_MS) return d;
    }
  }
  return new Date();
}

function validateProperties(v: unknown): Record<string, unknown> | null {
  if (v === null || v === undefined || typeof v !== 'object' || Array.isArray(v)) return null;
  const serialized = JSON.stringify(v);
  if (serialized.length > MAX_PROPS_JSON) return null;
  return v as Record<string, unknown>;
}

function clientIP(req: Request): string {
  // cf-connecting-ip is set by Cloudflare and is not forgeable
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  // x-real-ip is set by most reverse proxies to the real client IP
  const realIP = req.headers.get('x-real-ip');
  if (realIP) return realIP.trim();
  // x-forwarded-for: use the rightmost entry (appended by the trusted proxy),
  // not the leftmost (which is attacker-controlled)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts[parts.length - 1].trim() || '127.0.0.1';
  }
  return '127.0.0.1';
}

collectRoute.post('/', async (c) => {
  let body: Record<string, unknown>;
  try {
    const text = await c.req.text();
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return c.json({ error: 'Invalid body' }, 400);
  }

  // Validate all fields before hitting the database
  const apiKey = typeof body.api_key === 'string' ? body.api_key : null;
  if (!apiKey) return c.json({ error: 'Missing api_key' }, 400);

  const eventName = typeof body.event === 'string' ? body.event.slice(0, 100) : null;
  if (!eventName) return c.json({ error: 'Missing event' }, 400);

  const url = validateURL(body.url);
  const referrer = validateURL(body.referrer);
  const sessionId = sanitizeString(body.session_id);
  const anonymousId = sanitizeString(body.anonymous_id);
  const properties = validateProperties(body.properties);
  const timestamp = validateTimestamp(body.timestamp);

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.apiKey, apiKey))
    .limit(1);

  // Always 200 — don't leak whether a key exists
  if (!project) return c.json({ ok: true });

  const ip = clientIP(c.req.raw);
  const ua = c.req.header('user-agent') ?? '';

  const [{ browser, os, deviceType }, { country, city }] = await Promise.all([
    Promise.resolve(parseUA(ua)),
    geolocate(ip),
  ]);

  await db.insert(events).values({
    id: randomUUID(),
    projectId: project.id,
    eventName,
    url,
    referrer,
    browser: browser ?? null,
    os: os ?? null,
    deviceType: deviceType ?? null,
    country: country ?? null,
    city: city ?? null,
    sessionId,
    anonymousId,
    properties,
    timestamp,
  });

  return c.json({ ok: true });
});
