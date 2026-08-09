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
    <div className="flex gap-1 rounded-lg border border-zinc-200 p-1 bg-white">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => select(o.value)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            String(current) === o.value
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
