import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { projects, events } from '@trace/db';
import { db } from '../lib/db';
import { parseUA } from '../lib/ua';
import { geolocate } from '../lib/geo';

export const collectRoute = new Hono();

function clientIP(req: Request): string {
  const forwarded = req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    '';
  return forwarded.split(',')[0].trim() || '127.0.0.1';
}

async function parseBody(req: Request): Promise<Record<string, unknown>> {
  const ct = req.headers.get('content-type') ?? '';
  const text = await req.text();
  return JSON.parse(text) as Record<string, unknown>;
}

collectRoute.post('/', async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await parseBody(c.req.raw);
  } catch {
    return c.json({ error: 'Invalid body' }, 400);
  }

  const apiKey = body.api_key as string | undefined;
  if (!apiKey || typeof apiKey !== 'string') {
    return c.json({ error: 'Missing api_key' }, 400);
  }

  const eventName = body.event as string | undefined;
  if (!eventName || typeof eventName !== 'string') {
    return c.json({ error: 'Missing event' }, 400);
  }

  // Validate API key and find project
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.apiKey, apiKey))
    .limit(1);

  if (!project) {
    // Return 200 to avoid leaking whether a key exists
    return c.json({ ok: true });
  }

  const ip = clientIP(c.req.raw);
  const ua = c.req.header('user-agent') ?? '';

  // Enrich in parallel — neither should block ingestion on failure
  const [{ browser, os, deviceType }, { country, city }] = await Promise.all([
    Promise.resolve(parseUA(ua)),
    geolocate(ip),
  ]);

  await db.insert(events).values({
    id: randomUUID(),
    projectId: project.id,
    eventName,
    url: (body.url as string) || null,
    referrer: (body.referrer as string) || null,
    browser: browser ?? null,
    os: os ?? null,
    deviceType: deviceType ?? null,
    country: country ?? null,
    city: city ?? null,
    sessionId: (body.session_id as string) || null,
    anonymousId: (body.anonymous_id as string) || null,
    properties: (body.properties as Record<string, unknown>) ?? null,
    timestamp: body.timestamp ? new Date(body.timestamp as string) : new Date(),
  });

  return c.json({ ok: true });
});
