import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <span className="text-lg font-semibold tracking-tight">Trace</span>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-white text-zinc-950 px-4 py-1.5 rounded-md font-medium hover:bg-zinc-200 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
        <p className="text-sm text-zinc-500 mb-4 tracking-widest uppercase">Analytics for builders</p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-2xl">
          Know exactly what your users do
        </h1>
        <p className="text-zinc-400 text-lg max-w-md mb-10">
          Paste one script. See page views, clicks, sessions, funnels, and retention — all in one place.
        </p>
        <Link
          href="/sign-up"
          className="bg-white text-zinc-950 px-6 py-3 rounded-md font-semibold text-base hover:bg-zinc-200 transition-colors"
        >
          Start for free
        </Link>
      </div>
    </main>
  );
}
