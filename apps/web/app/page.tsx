import Link from 'next/link';

const features = [
  { title: 'Page views & sessions', desc: 'Every navigation tracked, including SPAs.' },
  { title: 'Real-time visitors', desc: 'See who is on your site right now.' },
  { title: 'Referrers & UTM', desc: 'Know exactly where your traffic comes from.' },
  { title: 'Geo & device data', desc: 'Country, browser, and device breakdowns.' },
  { title: 'Custom events', desc: 'Track clicks, signups, or anything else.' },
  { title: 'One script, 2 KB', desc: 'Async snippet that never slows your site.' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Trace</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 text-center pt-24 pb-16">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-xs font-medium mb-8 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Privacy-first analytics
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-3xl leading-[1.05]">
          Know exactly{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            what your users do
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-md mb-10 leading-relaxed">
          Paste one script. See page views, clicks, sessions, and retention — without the enterprise price tag.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-up"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-indigo-900/40"
          >
            Start for free
          </Link>
          <Link
            href="/sign-in"
            className="text-slate-400 hover:text-white px-6 py-3 text-sm transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </div>

      {/* Features grid */}
      <div className="border-t border-slate-800/60 py-16 px-8">
        <p className="text-center text-xs text-slate-500 uppercase tracking-widest mb-10">Everything you need</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-slate-800/40 max-w-4xl mx-auto rounded-xl overflow-hidden border border-slate-800/40">
          {features.map((f) => (
            <div key={f.title} className="bg-slate-900 px-6 py-5">
              <p className="text-sm font-medium text-white mb-1">{f.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-slate-800/60 px-8 py-5 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Trace. Built for builders.
      </footer>
    </main>
  );
}
