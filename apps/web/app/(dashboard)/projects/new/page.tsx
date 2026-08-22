import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createProject } from '@/actions/projects';

export default function NewProjectPage() {
  return (
    <div className="p-8 max-w-lg">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <h1 className="text-xl font-semibold text-slate-900 mb-1">New project</h1>
      <p className="text-sm text-slate-500 mb-8">
        A project tracks one website or app. You&apos;ll get a unique API key and tracking snippet.
      </p>

      <form action={createProject} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Project name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="My App"
            required
            className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="domain" className="text-sm font-medium text-slate-700">
            Domain{' '}
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            id="domain"
            name="domain"
            type="text"
            placeholder="myapp.com"
            className="bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
          <p className="text-xs text-slate-400">Used for display only. Tracking works on any domain.</p>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm mt-2"
        >
          Create project
        </button>
      </form>
    </div>
  );
}
