import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { collectRoute } from './routes/collect';
import { trackerRoute } from './routes/tracker';

const app = new Hono();

app.use('*', logger());

// Open CORS for public endpoints — tracking scripts run on any domain
app.use('/collect', cors());
app.use('/tracker.js', cors());

app.get('/health', (c) => c.json({ ok: true }));
app.route('/collect', collectRoute);
app.route('/tracker.js', trackerRoute);

const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`);
});
