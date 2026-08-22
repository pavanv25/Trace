# Trace

> Privacy-first, self-hosted web analytics. Track page views, sessions, clicks, funnels, and more — without the enterprise pricing.

---

## What it does

Trace gives you a full picture of how people use your web app. Drop in a 2 KB tracking snippet and you get:

- **Page view tracking** — every navigation, including SPAs that use `history.pushState`
- **Event tracking** — clicks, form submissions, or any custom event you want
- **Session & visitor identification** — anonymous IDs in localStorage/sessionStorage, no cookies required
- **Real-time active users** — live count of sessions active in the last 5 minutes
- **Geographic breakdown** — country-level data from visitor IP addresses
- **Referrer analytics** — where your traffic comes from, host-level
- **Browser & device breakdown** — Chrome vs Safari, desktop vs mobile
- **Flexible date ranges** — filter by last 7, 14, or 30 days

---

## Architecture

```
Trace/
├── apps/
│   ├── api/          # Hono ingestion API (Node.js)
│   └── web/          # Next.js 15 dashboard (App Router)
└── packages/
    ├── db/           # Drizzle ORM schema + Neon Postgres client
    └── tracker/      # Browser tracking snippet (IIFE, ~2 KB minified)
```

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Dashboard | Next.js 15, App Router, Server Actions |
| Ingestion API | Hono on Node.js |
| Database | Drizzle ORM + Neon (serverless Postgres) |
| Auth | Clerk |
| Charts | Recharts |
| Styling | Tailwind CSS v4 |
| Tracker | TypeScript → esbuild IIFE, ~2 KB gzipped |

---

## How the tracker works

The snippet is a tiny IIFE (~2 KB minified) that loads asynchronously and never blocks page render.

```html
<!-- Paste once in your <head> -->
<script>
  window.trace=window.trace||function(){(window.trace.q=window.trace.q||[]).push(arguments)};
</script>
<script src="https://your-api.com/tracker.js" async></script>
<script>
  trace('init', 'pk_your_api_key', { endpoint: 'https://your-api.com' });
</script>
```

**Key design decisions:**

- Events are sent with `navigator.sendBeacon` (fallback: `fetch` with `keepalive: true`) so they survive page unloads
- Uses `text/plain` content type to avoid CORS preflight — zero extra round-trips
- SPA navigation is tracked by monkey-patching `history.pushState` with a one-time guard to prevent double-patching if the script loads twice
- Bot traffic is filtered by checking `navigator.webdriver` and common crawler user agents
- Anonymous ID persists in `localStorage`; session ID lives in `sessionStorage`

---

## Ingestion API

The `/collect` endpoint accepts events from the tracker and enforces:

- **50 KB body limit** — rejects oversized payloads
- **Timestamp validation** — events more than 24 hours old or in the future fall back to server time
- **URL/referrer validation** — only `http://` and `https://` URLs are stored
- **Properties size cap** — custom properties capped at 4 KB serialized
- **Silent key rejection** — invalid API keys return `200 OK` without leaking whether the key exists
- **IP geolocation** — via [ipapi.co](https://ipapi.co) (HTTPS, 2 s timeout, never blocks ingestion)
- **User agent parsing** — via ua-parser-js v2

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 9+
- A [Neon](https://neon.tech) Postgres database
- A [Clerk](https://clerk.com) account

### 1. Clone and install

```bash
git clone https://github.com/your-username/Trace.git
cd Trace
pnpm install
```

### 2. Set environment variables

**`apps/api/.env`**
```env
DATABASE_URL=postgresql://...
```

**`apps/web/.env.local`**
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Push the database schema

```bash
pnpm --filter @trace/db exec drizzle-kit push
```

### 4. Build the tracker

```bash
pnpm --filter @trace/tracker build
```

### 5. Start development servers

```bash
pnpm dev
```

- Dashboard → http://localhost:3000
- Ingestion API → http://localhost:3001

---

## Project pages

Each project in Trace has a dedicated page showing:

| Section | Description |
|---|---|
| Live counter | Active sessions in the last 5 minutes, auto-refreshes every 30 s |
| Stats row | Page views, unique visitors, total events for the selected period |
| Page views chart | Daily page view trend (line chart) |
| Top pages | Most-visited URLs ranked by view count |
| Top events | Most-fired event names |
| Referrers | Traffic sources by hostname |
| Countries | Visitor geography |
| Browsers / Devices | Browser and device type breakdown (bar charts) |
| Tracking snippet | Copy-paste HTML snippet for your site |

---

## Data model

Every interaction is stored as a single row in the `events` table:

| Column | Type | Description |
|---|---|---|
| `id` | text | UUID |
| `project_id` | text | FK → projects |
| `event_name` | text | e.g. `page_view`, `click`, `form_submit` |
| `url` | text | Current page URL |
| `referrer` | text | HTTP referrer |
| `browser` | text | e.g. `Chrome` |
| `os` | text | e.g. `macOS` |
| `device_type` | text | `desktop`, `mobile`, `tablet` |
| `country` | text | Country name from IP geolocation |
| `city` | text | City from IP geolocation |
| `session_id` | text | Session ID from sessionStorage |
| `anonymous_id` | text | Visitor ID from localStorage |
| `properties` | jsonb | Custom properties (max 4 KB) |
| `timestamp` | timestamp | Event time |

---

## License

MIT
