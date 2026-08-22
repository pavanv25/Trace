'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { deleteProject } from '@/actions/projects';

export function DeleteProjectButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete project
      </button>
    );
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-800">Delete &quot;{projectName}&quot;?</p>
        <p className="text-xs text-red-600 mt-0.5">This permanently removes all events. There&apos;s no undo.</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <form action={deleteProject.bind(null, projectId)}>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
