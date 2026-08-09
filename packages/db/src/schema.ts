import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  domain: text('domain'),
  apiKey: text('api_key').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const events = pgTable(
  'events',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    eventName: text('event_name').notNull(),
    url: text('url'),
    referrer: text('referrer'),
    browser: text('browser'),
    os: text('os'),
    deviceType: text('device_type'),
    country: text('country'),
    city: text('city'),
    sessionId: text('session_id'),
    anonymousId: text('anonymous_id'),
    properties: jsonb('properties'),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (table) => [
    index('events_project_id_idx').on(table.projectId),
    index('events_timestamp_idx').on(table.timestamp),
    index('events_project_timestamp_idx').on(table.projectId, table.timestamp),
  ]
);

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Event = typeof events.$inferSelect;
