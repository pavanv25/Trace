'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteProject } from '@/actions/projects';

export function DeleteProjectButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete project
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
      <p className="text-sm text-red-700 flex-1">
        Delete <strong>{projectName}</strong>? This will permanently remove all events and cannot be undone.
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          Cancel
        </button>
        <form action={deleteProject.bind(null, projectId)}>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
