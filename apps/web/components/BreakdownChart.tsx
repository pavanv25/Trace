'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DataPoint {
  name: string | null;
  count: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff', '#faf5ff'];

export function BreakdownChart({ data, label }: { data: DataPoint[]; label: string }) {
  const cleaned = data
    .filter((d) => d.name)
    .map((d) => ({ name: d.name as string, count: d.count }));

  if (cleaned.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-400">
        No data for this period
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={cleaned} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: '#374151' }}
          width={80}
        />
        <Tooltip
          contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(value) => [value, label]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {cleaned.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
