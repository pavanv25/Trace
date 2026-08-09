import { createProject } from '@/actions/projects';

export default function NewProjectPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">New project</h1>
      <p className="text-zinc-500 text-sm mb-8">
        A project represents one website or app you want to track.
      </p>

      <form action={createProject} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700">
            Project name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="My App"
            required
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="domain" className="text-sm font-medium text-zinc-700">
            Domain <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <input
            id="domain"
            name="domain"
            type="text"
            placeholder="myapp.com"
            className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="bg-zinc-900 text-white text-sm px-4 py-2.5 rounded-md hover:bg-zinc-700 transition-colors font-medium"
        >
          Create project
        </button>
      </form>
    </div>
  );
}
