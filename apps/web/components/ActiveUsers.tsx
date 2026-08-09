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

    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [projectId]);

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${count > 0 ? 'bg-green-400' : 'bg-zinc-300'}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${count > 0 ? 'bg-green-500' : 'bg-zinc-400'}`} />
      </span>
      <span className="text-sm font-medium text-zinc-700">
        {count} active {count === 1 ? 'user' : 'users'} now
      </span>
    </div>
  );
}
