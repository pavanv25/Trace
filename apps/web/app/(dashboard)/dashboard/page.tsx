import Link from 'next/link';
import { Plus, Globe, ArrowUpRight } from 'lucide-react';
import { getProjects } from '@/actions/projects';

export default async function DashboardPage() {
  const projects = await getProjects();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">Each project tracks one website or app.</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3.5 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl py-24 text-center bg-white">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-slate-700 font-medium mb-1">No projects yet</p>
          <p className="text-sm text-slate-400 mb-6">Create a project to start tracking your site.</p>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/50 transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-slate-900 truncate">{project.name}</h2>
                    {project.domain ? (
                      <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                        <Globe className="w-3 h-3 shrink-0" />
                        {project.domain}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-300 mt-0.5">No domain set</p>
                    )}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  Created {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
