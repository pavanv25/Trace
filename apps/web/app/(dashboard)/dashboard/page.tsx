import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getProjects } from '@/actions/projects';

export default async function DashboardPage() {
  const projects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Projects</h1>
          <p className="text-sm text-zinc-500 mt-1">Each project tracks one website or app.</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 bg-zinc-900 text-white text-sm px-4 py-2 rounded-md hover:bg-zinc-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-zinc-300 rounded-xl py-20 text-center">
          <p className="text-zinc-500 mb-4">No projects yet.</p>
          <Link href="/projects/new" className="text-sm text-zinc-900 underline underline-offset-2">
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="border border-zinc-200 rounded-xl p-5 hover:border-zinc-400 hover:shadow-sm transition-all">
                <h2 className="font-semibold text-zinc-900">{project.name}</h2>
                {project.domain && (
                  <p className="text-sm text-zinc-500 mt-1">{project.domain}</p>
                )}
                <p className="text-xs text-zinc-400 mt-3">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
