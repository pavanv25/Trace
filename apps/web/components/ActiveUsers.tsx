'use client';

import { useEffect, useState } from 'react';
import { getActiveUsers } from '@/actions/analytics';

export function ActiveUsers({ projectId, initial }: { projectId: string; initial: number }) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    const tick = async () => {
      try {
        const n = await getActiveUsers(projectId);
        setCount(Number(n));
      } catch {
        // silently ignore — stale count is fine
      }
    };

    // Also refresh immediately after hydration
    void tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [projectId]);

  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${
            count > 0 ? 'bg-emerald-400' : 'bg-slate-300'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            count > 0 ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        />
      </span>
      <span className="text-xs font-medium text-slate-600">
        {count} online
      </span>
    </div>
  );
}
