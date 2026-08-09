import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { collectRoute } from './routes/collect';

const app = new Hono();

app.use('*', logger());

// Collect endpoint is open to all origins — tracking scripts run on any domain
app.use('/collect/*', cors());

app.get('/health', (c) => c.json({ ok: true }));
app.route('/collect', collectRoute);

const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`);
});
