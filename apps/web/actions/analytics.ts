'use server';

import { auth } from '@clerk/nextjs/server';
import { and, count, countDistinct, desc, eq, gte, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { events, projects } from '@trace/db';

// Returns userId after verifying auth + ownership. Redirects on failure.
// Call this BEFORE any Promise.all to ensure redirect() propagates correctly.
export async function assertProjectOwner(projectId: string): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const [p] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  if (!p) redirect('/dashboard');
  return userId;
}

function since(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// Fills a date-spine so every day in the range appears, even with 0 events.
function fillDateSpine(
  rows: { date: string; count: number }[],
  days: number
): { date: string; count: number }[] {
  const map = new Map(rows.map((r) => [r.date, r.count]));
  const result: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    result.push({ date: key, count: map.get(key) ?? 0 });
  }
  return result;
}

export async function getStats(projectId: string, days = 7) {
  await assertProjectOwner(projectId);
  const from = since(days);

  const [views, visitors, total] = await Promise.all([
    db
      .select({ count: count() })
      .from(events)
      .where(and(eq(events.projectId, projectId), eq(events.eventName, 'page_view'), gte(events.timestamp, from))),
    db
      .select({ count: countDistinct(events.anonymousId) })
      .from(events)
      .where(and(eq(events.projectId, projectId), gte(events.timestamp, from))),
    db
      .select({ count: count() })
      .from(events)
      .where(and(eq(events.projectId, projectId), gte(events.timestamp, from))),
  ]);

  return {
    pageViews: views[0]?.count ?? 0,
    uniqueVisitors: visitors[0]?.count ?? 0,
    totalEvents: total[0]?.count ?? 0,
  };
}

export async function getPageViewsOverTime(projectId: string, days = 7) {
  await assertProjectOwner(projectId);
  const from = since(days);

  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${events.timestamp} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(events)
    .where(and(eq(events.projectId, projectId), eq(events.eventName, 'page_view'), gte(events.timestamp, from)))
    .groupBy(sql`date_trunc('day', ${events.timestamp} AT TIME ZONE 'UTC')`)
    .orderBy(sql`date_trunc('day', ${events.timestamp} AT TIME ZONE 'UTC')`);

  return fillDateSpine(rows.map((r) => ({ date: r.date, count: Number(r.count) })), days);
}

export async function getTopPages(projectId: string, days = 7) {
  await assertProjectOwner(projectId);
  const from = since(days);

  // Group by path only (strip query strings) using regexp_replace
  return db
    .select({
      url: sql<string>`regexp_replace(${events.url}, '\\?.*$', '')`,
      count: count(),
    })
    .from(events)
    .where(and(eq(events.projectId, projectId), eq(events.eventName, 'page_view'), gte(events.timestamp, from), sql`${events.url} IS NOT NULL`))
    .groupBy(sql`regexp_replace(${events.url}, '\\?.*$', '')`)
    .orderBy(desc(count()))
    .limit(10);
}

export async function getTopEvents(projectId: string, days = 7) {
  await assertProjectOwner(projectId);
  const from = since(days);

  return db
    .select({ eventName: events.eventName, count: count() })
    .from(events)
    .where(and(eq(events.projectId, projectId), gte(events.timestamp, from)))
    .groupBy(events.eventName)
    .orderBy(desc(count()))
    .limit(10);
}

export async function getBrowserBreakdown(projectId: string, days = 7) {
  await assertProjectOwner(projectId);
  const from = since(days);

  return db
    .select({ name: events.browser, count: count() })
    .from(events)
    .where(and(eq(events.projectId, projectId), gte(events.timestamp, from), sql`${events.browser} IS NOT NULL`))
    .groupBy(events.browser)
    .orderBy(desc(count()))
    .limit(8);
}

export async function getDeviceBreakdown(projectId: string, days = 7) {
  await assertProjectOwner(projectId);
  const from = since(days);

  return db
    .select({ name: events.deviceType, count: count() })
    .from(events)
    .where(and(eq(events.projectId, projectId), gte(events.timestamp, from), sql`${events.deviceType} IS NOT NULL`))
    .groupBy(events.deviceType)
    .orderBy(desc(count()))
    .limit(6);
}

export async function getCountryBreakdown(projectId: string, days = 7) {
  await assertProjectOwner(projectId);
  const from = since(days);

  return db
    .select({ name: events.country, count: count() })
    .from(events)
    .where(and(eq(events.projectId, projectId), gte(events.timestamp, from), sql`${events.country} IS NOT NULL`))
    .groupBy(events.country)
    .orderBy(desc(count()))
    .limit(10);
}

export async function getReferrerBreakdown(projectId: string, days = 7) {
  await assertProjectOwner(projectId);
  const from = since(days);

  return db
    .select({ referrer: events.referrer, count: count() })
    .from(events)
    .where(and(eq(events.projectId, projectId), eq(events.eventName, 'page_view'), gte(events.timestamp, from), sql`${events.referrer} IS NOT NULL`))
    .groupBy(events.referrer)
    .orderBy(desc(count()))
    .limit(10);
}

// Returns count of unique sessions active in the last 5 minutes
export async function getActiveUsers(projectId: string) {
  await assertProjectOwner(projectId);
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

  const [row] = await db
    .select({ count: countDistinct(events.sessionId) })
    .from(events)
    .where(and(eq(events.projectId, projectId), gte(events.timestamp, fiveMinAgo), sql`${events.sessionId} IS NOT NULL`));

  return row?.count ?? 0;
}
