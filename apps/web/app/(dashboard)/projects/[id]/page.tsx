import { getProject } from '@/actions/projects';
import { deleteProject } from '@/actions/projects';
import { Copy, Trash2 } from 'lucide-react';
import { CopyButton } from './copy-button';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const snippet = `<!-- Trace Analytics -->
<script>
  window.trace=window.trace||function(){(window.trace.q=window.trace.q||[]).push(arguments)};
</script>
<script src="${apiUrl}/tracker.js" async></script>
<script>
  trace('init', '${project.apiKey}', { endpoint: '${apiUrl}' });
</script>`;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">{project.name}</h1>
        {project.domain && <p className="text-zinc-500 text-sm mt-1">{project.domain}</p>}
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">API Key</h2>
        <div className="flex items-center gap-2 bg-zinc-100 rounded-md px-4 py-3">
          <code className="text-sm text-zinc-800 flex-1 font-mono">{project.apiKey}</code>
          <CopyButton text={project.apiKey} />
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          This key is public — it can only write events, not read them.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">Tracking snippet</h2>
        <p className="text-sm text-zinc-500 mb-3">
          Paste this in the <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">&lt;head&gt;</code> of your site.
        </p>
        <div className="relative bg-zinc-950 rounded-xl p-5">
          <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap overflow-x-auto">{snippet}</pre>
          <div className="absolute top-3 right-3">
            <CopyButton text={snippet} dark />
          </div>
        </div>
      </section>

      <section className="border border-zinc-200 rounded-xl p-6 text-center text-zinc-500">
        <p className="text-sm">Analytics coming in the next phase.</p>
        <p className="text-xs mt-1 text-zinc-400">Install the snippet above to start collecting data.</p>
      </section>

      <div className="mt-10 pt-6 border-t border-zinc-200">
        <form action={deleteProject.bind(null, project.id)}>
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete project
          </button>
        </form>
      </div>
    </div>
  );
}
