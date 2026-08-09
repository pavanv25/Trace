import { Suspense } from 'react';
import { getProject } from '@/actions/projects';
import { deleteProject } from '@/actions/projects';
import {
  assertProjectOwner,
  getStats,
  getPageViewsOverTime,
  getTopPages,
  getTopEvents,
  getBrowserBreakdown,
  getDeviceBreakdown,
  getCountryBreakdown,
  getReferrerBreakdown,
  getActiveUsers,
} from '@/actions/analytics';
import { Trash2, Eye, Users, Zap } from 'lucide-react';
import { CopyButton } from './copy-button';
import { PageViewsChart } from '@/components/PageViewsChart';
import { BreakdownChart } from '@/components/BreakdownChart';
import { DateRangeSelector } from '@/components/DateRangeSelector';
import { ActiveUsers } from '@/components/ActiveUsers';
import { DeleteProjectButton } from './delete-button';

const VALID_DAYS = [7, 14, 30];

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 flex items-start gap-4">
      <div className="rounded-lg bg-indigo-50 p-2">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900">{value.toLocaleString()}</p>
        <p className="text-sm text-zinc-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function safePathname(url: string | null): string {
  if (!url) return '—';
  try { return new URL(url).pathname; } catch { return url; }
}

function safeHostname(url: string | null): string {
  if (!url) return '(direct)';
  try { return new URL(url).hostname; } catch { return url; }
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ days?: string }>;
}) {
  const { id } = await params;
  const { days: daysParam } = await searchParams;
  const days = VALID_DAYS.includes(Number(daysParam)) ? Number(daysParam) : 7;

  // Auth + ownership check runs first — redirect() propagates correctly outside Promise.all
  await assertProjectOwner(id);

  const [
    project,
    statsResult,
    chartResult,
    topPagesResult,
    topEventsResult,
    browsersResult,
    devicesResult,
    countriesResult,
    referrersResult,
    activeNowResult,
  ] = await Promise.allSettled([
    getProject(id),
    getStats(id, days),
    getPageViewsOverTime(id, days),
    getTopPages(id, days),
    getTopEvents(id, days),
    getBrowserBreakdown(id, days),
    getDeviceBreakdown(id, days),
    getCountryBreakdown(id, days),
    getReferrerBreakdown(id, days),
    getActiveUsers(id),
  ]);

  // Project must succeed — nothing to show otherwise
  if (project.status === 'rejected') throw project.reason;

  const p = project.value;
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : { pageViews: 0, uniqueVisitors: 0, totalEvents: 0 };
  const chartData = chartResult.status === 'fulfilled' ? chartResult.value : [];
  const topPages = topPagesResult.status === 'fulfilled' ? topPagesResult.value : [];
  const topEvents = topEventsResult.status === 'fulfilled' ? topEventsResult.value : [];
  const browsers = browsersResult.status === 'fulfilled' ? browsersResult.value : [];
  const devices = devicesResult.status === 'fulfilled' ? devicesResult.value : [];
  const countries = countriesResult.status === 'fulfilled' ? countriesResult.value : [];
  const referrers = referrersResult.status === 'fulfilled' ? referrersResult.value : [];
  const activeNow = activeNowResult.status === 'fulfilled' ? activeNowResult.value : 0;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const snippet = `<!-- Trace Analytics -->
<script>
  window.trace=window.trace||function(){(window.trace.q=window.trace.q||[]).push(arguments)};
</script>
<script src="${apiUrl}/tracker.js" async></script>
<script>
  trace('init', '${p.apiKey}', { endpoint: '${apiUrl}' });
</script>`;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{p.name}</h1>
          {p.domain && <p className="text-zinc-500 text-sm mt-1">{p.domain}</p>}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <ActiveUsers projectId={id} initial={Number(activeNow)} />
          <Suspense>
            <DateRangeSelector current={days} />
          </Suspense>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Page views" value={stats.pageViews} icon={Eye} />
        <StatCard label="Unique visitors" value={stats.uniqueVisitors} icon={Users} />
        <StatCard label="Total events" value={stats.totalEvents} icon={Zap} />
      </div>

      {/* Page views over time */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h2 className="text-sm font-semibold text-zinc-700 mb-4">Page views over time</h2>
        <PageViewsChart data={chartData.map((d) => ({ date: d.date, count: d.count }))} />
      </div>

      {/* Top pages + Top events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Top pages</h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-zinc-400">No data yet</p>
          ) : (
            <ul className="space-y-2">
              {topPages.map((pg, i) => (
                <li key={pg.url ?? i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700 truncate max-w-[200px]" title={pg.url ?? ''}>
                    {safePathname(pg.url)}
                  </span>
                  <span className="text-zinc-500 tabular-nums">{Number(pg.count).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Top events</h2>
          {topEvents.length === 0 ? (
            <p className="text-sm text-zinc-400">No data yet</p>
          ) : (
            <ul className="space-y-2">
              {topEvents.map((e, i) => (
                <li key={e.eventName ?? i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700 font-mono">{e.eventName}</span>
                  <span className="text-zinc-500 tabular-nums">{Number(e.count).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Referrers + Countries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Referrers</h2>
          {referrers.length === 0 ? (
            <p className="text-sm text-zinc-400">No referral traffic</p>
          ) : (
            <ul className="space-y-2">
              {referrers.map((r, i) => (
                <li key={r.referrer ?? i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700 truncate max-w-[200px]" title={r.referrer ?? ''}>{safeHostname(r.referrer)}</span>
                  <span className="text-zinc-500 tabular-nums">{Number(r.count).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Countries</h2>
          {countries.length === 0 ? (
            <p className="text-sm text-zinc-400">No geo data yet</p>
          ) : (
            <ul className="space-y-2">
              {countries.map((c, i) => (
                <li key={c.name ?? i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700">{c.name ?? 'Unknown'}</span>
                  <span className="text-zinc-500 tabular-nums">{Number(c.count).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Browser + Device breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Browsers</h2>
          <BreakdownChart data={browsers.map((b) => ({ name: b.name, count: Number(b.count) }))} label="Events" />
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Devices</h2>
          <BreakdownChart data={devices.map((d) => ({ name: d.name, count: Number(d.count) }))} label="Events" />
        </div>
      </div>

      {/* Snippet */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">Tracking snippet</h2>
        <p className="text-sm text-zinc-500 mb-3">
          Paste this in the <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">&lt;head&gt;</code> of your site.
        </p>
        <div className="relative bg-zinc-950 rounded-xl p-5">
          <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap overflow-x-auto">{snippet}</pre>
          <div className="absolute top-3 right-3">
            <CopyButton text={snippet} dark />
          </div>
        </div>
      </section>

      {/* API Key */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">API Key</h2>
        <div className="flex items-center gap-2 bg-zinc-100 rounded-md px-4 py-3">
          <code className="text-sm text-zinc-800 flex-1 font-mono">{p.apiKey}</code>
          <CopyButton text={p.apiKey} />
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          This key is public — it can only write events, not read them.
        </p>
      </section>

      {/* Danger zone */}
      <div className="pt-6 border-t border-zinc-200">
        <DeleteProjectButton projectId={p.id} projectName={p.name} />
      </div>
    </div>
  );
}
