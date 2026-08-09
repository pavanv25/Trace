interface DataPoint {
  name: string | null;
  count: number;
}

export function ProgressBreakdown({ data }: { data: DataPoint[] }) {
  const cleaned = data
    .filter((d) => d.name != null)
    .map((d) => ({ name: d.name as string, count: d.count }));

  const max = Math.max(...cleaned.map((d) => d.count), 1);
  const total = cleaned.reduce((s, d) => s + d.count, 0);

  if (cleaned.length === 0) {
    return <p className="text-sm text-slate-400 py-4">No data for this period</p>;
  }

  return (
    <ul className="space-y-0.5">
      {cleaned.map((item) => (
        <li key={item.name} className="relative rounded-md overflow-hidden group">
          {/* Progress bar background */}
          <div
            className="absolute inset-y-0 left-0 bg-indigo-50 group-hover:bg-indigo-100 rounded-md transition-all"
            style={{ width: `${(item.count / max) * 100}%` }}
          />
          <div className="relative flex items-center justify-between px-3 py-2">
            <span className="text-sm text-slate-700 truncate max-w-[55%] font-medium">{item.name}</span>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-400 w-8 text-right">
                {total > 0 ? Math.round((item.count / total) * 100) : 0}%
              </span>
              <span className="text-sm text-slate-600 tabular-nums w-12 text-right">
                {item.count.toLocaleString()}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
