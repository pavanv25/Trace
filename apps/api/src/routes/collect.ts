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
  const forwarded =
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    '';
  return forwarded.split(',')[0].trim() || '127.0.0.1';
}

collectRoute.post('/', async (c) => {
  let body: Record<string, unknown>;
  try {
    const text = await c.req.text();
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return c.json({ error: 'Invalid body' }, 400);
  }

  const apiKey = typeof body.api_key === 'string' ? body.api_key : null;
  if (!apiKey) return c.json({ error: 'Missing api_key' }, 400);

  const eventName = typeof body.event === 'string' ? body.event.slice(0, 100) : null;
  if (!eventName) return c.json({ error: 'Missing event' }, 400);

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
    url: validateURL(body.url),
    referrer: validateURL(body.referrer),
    browser: browser ?? null,
    os: os ?? null,
    deviceType: deviceType ?? null,
    country: country ?? null,
    city: city ?? null,
    sessionId: sanitizeString(body.session_id),
    anonymousId: sanitizeString(body.anonymous_id),
    properties: validateProperties(body.properties),
    timestamp: validateTimestamp(body.timestamp),
  });

  return c.json({ ok: true });
});
