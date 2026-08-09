'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  date: string;
  count: number;
}

function formatDate(dateStr: string, short = false) {
  const d = new Date(dateStr + 'T00:00:00Z');
  if (short) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function PageViewsChart({ data }: { data: DataPoint[] }) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <div className="relative">
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p className="text-sm text-slate-400">No page views in this period</p>
        </div>
      )}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="pageViewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => formatDate(v, true)}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#475569', fontWeight: 500, marginBottom: 4 }}
            itemStyle={{ color: '#6366f1' }}
            labelFormatter={(v: unknown) => formatDate(String(v))}
            formatter={(value) => [value, 'Page views']}
            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#pageViewsGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
