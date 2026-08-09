import { getProject } from '@/actions/projects';
import { deleteProject } from '@/actions/projects';
import {
  getStats,
  getPageViewsOverTime,
  getTopPages,
  getTopEvents,
  getBrowserBreakdown,
  getDeviceBreakdown,
} from '@/actions/analytics';
import { Trash2, Eye, Users, Zap } from 'lucide-react';
import { CopyButton } from './copy-button';
import { PageViewsChart } from '@/components/PageViewsChart';
import { BreakdownChart } from '@/components/BreakdownChart';

const DAYS = 7;

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

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [project, stats, chartData, topPages, topEvents, browsers, devices] = await Promise.all([
    getProject(id),
    getStats(id, DAYS),
    getPageViewsOverTime(id, DAYS),
    getTopPages(id, DAYS),
    getTopEvents(id, DAYS),
    getBrowserBreakdown(id, DAYS),
    getDeviceBreakdown(id, DAYS),
  ]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const snippet = `<!-- Trace Analytics -->
<script>
  window.trace=window.trace||function(){(window.trace.q=window.trace.q||[]).push(arguments)};
</script>
<script src="${apiUrl}/tracker.js" async></script>
<script>
  trace('init', '${project.apiKey}', { endpoint: '${apiUrl}' });
</script>`;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{project.name}</h1>
        {project.domain && <p className="text-zinc-500 text-sm mt-1">{project.domain}</p>}
        <p className="text-xs text-zinc-400 mt-1">Last {DAYS} days</p>
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
        <PageViewsChart data={chartData.map((d) => ({ date: d.date, count: Number(d.count) }))} />
      </div>

      {/* Top pages + Top events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Top pages</h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-zinc-400">No data yet</p>
          ) : (
            <ul className="space-y-2">
              {topPages.map((p, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700 truncate max-w-[200px]" title={p.url ?? ''}>
                    {p.url ? new URL(p.url).pathname : '—'}
                  </span>
                  <span className="text-zinc-500 tabular-nums">{Number(p.count).toLocaleString()}</span>
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
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700 font-mono">{e.eventName}</span>
                  <span className="text-zinc-500 tabular-nums">{Number(e.count).toLocaleString()}</span>
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
          <code className="text-sm text-zinc-800 flex-1 font-mono">{project.apiKey}</code>
          <CopyButton text={project.apiKey} />
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          This key is public — it can only write events, not read them.
        </p>
      </section>

      {/* Danger zone */}
      <div className="pt-6 border-t border-zinc-200">
        <form action={deleteProject.bind(null, project.id)}>
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete project
          </button>
        </form>
      </div>
    </div>
  );
}
