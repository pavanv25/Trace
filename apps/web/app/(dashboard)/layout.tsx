import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-52 bg-slate-950 flex flex-col px-3 py-5 shrink-0">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 mb-7">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
            <span className="text-white text-xs font-bold tracking-tight">T</span>
          </div>
          <span className="font-semibold text-white tracking-tight text-sm">Trace</span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-sm px-2 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Dashboard
          </Link>
        </nav>

        {/* User */}
        <div className="mt-auto pt-3 border-t border-slate-800 px-1">
          <UserButton showName afterSignOutUrl="/" />
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-50">{children}</main>
    </div>
  );
}
