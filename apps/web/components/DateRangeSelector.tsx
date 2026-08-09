'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const OPTIONS = [
  { label: '7d', value: '7' },
  { label: '14d', value: '14' },
  { label: '30d', value: '30' },
];

export function DateRangeSelector({ current }: { current: number }) {
  const router = useRouter();
  const params = useSearchParams();

  function select(days: string) {
    const next = new URLSearchParams(params.toString());
    next.set('days', days);
    router.push(`?${next.toString()}`);
  }

  return (
    <div className="flex gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => select(o.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            String(current) === o.value
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
