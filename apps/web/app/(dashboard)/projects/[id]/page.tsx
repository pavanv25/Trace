import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Code2, Key } from 'lucide-react';
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
import { CopyButton } from './copy-button';
import { PageViewsChart } from '@/components/PageViewsChart';
import { ProgressBreakdown } from '@/components/ProgressBreakdown';
import { DateRangeSelector } from '@/components/DateRangeSelector';
import { ActiveUsers } from '@/components/ActiveUsers';
import { DeleteProjectButton } from './delete-button';

const VALID_DAYS = [7, 14, 30];

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 px-5 py-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function safePathname(url: string | null): string {
  if (!url) return '—';
  try { return new URL(url).pathname || '/'; } catch { return url; }
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

  if (project.status === 'rejected') throw project.reason;
  if (!project.value) throw new Error('Project not found');

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
  const snippet = `<script>
  window.trace=window.trace||function(){(window.trace.q=window.trace.q||[]).push(arguments)};
</script>
<script src="${apiUrl}/tracker.js" async></script>
<script>
  trace('init', '${p.apiKey}', { endpoint: '${apiUrl}' });
</script>`;

  return (
    <div className="min-h-full">
      {/* Top bar */}
      <div className="border-b border-slate-200/80 bg-white px-8 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-slate-900 truncate">{p.name}</h1>
              {p.domain && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Globe className="w-3 h-3" />
                  {p.domain}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <ActiveUsers projectId={id} initial={Number(activeNow)} />
            <Suspense>
              <DateRangeSelector current={days} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5 max-w-5xl">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Page views" value={stats.pageViews} />
          <StatCard label="Unique visitors" value={stats.uniqueVisitors} />
          <StatCard label="Total events" value={stats.totalEvents} />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm px-5 py-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Page views over time</h2>
          <PageViewsChart data={chartData} />
        </div>

        {/* Top pages + Top events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SectionCard title="Top pages">
            <ProgressBreakdown
              data={topPages.map((pg) => ({
                name: safePathname(pg.url),
                count: Number(pg.count),
              }))}
            />
          </SectionCard>
          <SectionCard title="Top events">
            <ProgressBreakdown
              data={topEvents.map((e) => ({
                name: e.eventName,
                count: Number(e.count),
              }))}
            />
          </SectionCard>
        </div>

        {/* Referrers + Countries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SectionCard title="Referrers">
            <ProgressBreakdown
              data={referrers.map((r) => ({
                name: safeHostname(r.referrer),
                count: Number(r.count),
              }))}
            />
          </SectionCard>
          <SectionCard title="Countries">
            <ProgressBreakdown
              data={countries.map((c) => ({
                name: c.name ?? 'Unknown',
                count: Number(c.count),
              }))}
            />
          </SectionCard>
        </div>

        {/* Browsers + Devices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SectionCard title="Browsers">
            <ProgressBreakdown
              data={browsers.map((b) => ({
                name: b.name,
                count: Number(b.count),
              }))}
            />
          </SectionCard>
          <SectionCard title="Devices">
            <ProgressBreakdown
              data={devices.map((d) => ({
                name: d.name,
                count: Number(d.count),
              }))}
            />
          </SectionCard>
        </div>

        {/* Setup section */}
        <div className="border-t border-slate-200 pt-5 space-y-3">
          {/* Snippet */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">Tracking snippet</h2>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-3">
                Paste into the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">&lt;head&gt;</code> of every page you want to track.
              </p>
              <div className="relative rounded-xl overflow-hidden bg-slate-950">
                <pre className="text-xs text-slate-300 font-mono p-4 whitespace-pre-wrap overflow-x-auto leading-relaxed">{snippet}</pre>
                <div className="absolute top-3 right-3">
                  <CopyButton text={snippet} dark />
                </div>
              </div>
            </div>
          </div>

          {/* API Key */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">API Key</h2>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                <code className="text-sm text-slate-700 flex-1 font-mono tracking-tight truncate">{p.apiKey}</code>
                <CopyButton text={p.apiKey} />
              </div>
              <p className="text-xs text-slate-400 mt-2">Write-only — this key can send events but cannot read your data.</p>
            </div>
          </div>
        </div>

        {/* Danger */}
        <div className="pt-2 pb-8">
          <DeleteProjectButton projectId={p.id} projectName={p.name} />
        </div>
      </div>
    </div>
  );
}
