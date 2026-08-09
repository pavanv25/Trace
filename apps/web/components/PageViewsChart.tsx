'use client';

import {
  LineChart,
  Line,
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

export function PageViewsChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No data for this period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          tickFormatter={(v: string) => {
            const d = new Date(v + 'T00:00:00');
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
        />
        <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e5e7eb' }}
          labelFormatter={(v) => {
            if (typeof v !== 'string') return String(v);
            const d = new Date(v + 'T00:00:00');
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          }}
          formatter={(value) => [value, 'Page views']}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
