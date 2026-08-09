import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { BarChart2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-zinc-200 flex flex-col px-4 py-6 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 font-semibold text-zinc-900">
          <BarChart2 className="w-5 h-5" />
          Trace
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          <Link href="/dashboard" className="text-sm px-3 py-2 rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
            Dashboard
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-zinc-200">
          <UserButton showName />
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
