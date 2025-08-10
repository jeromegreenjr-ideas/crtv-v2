"use client";
import { useEffect, useState } from 'react';

export default function BulkOps({ projectId }: { projectId: number }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [assigneeId, setAssigneeId] = useState<string>('');

  useEffect(() => {
    fetch(`/api/projects/${projectId}/tasks`).then(r => r.json()).then(j => setTasks(j.tasks || [])).catch(() => {});
  }, [projectId]);

  const ids = Object.entries(selected).filter(([_, v]) => v).map(([k]) => Number(k));

  async function assignMany() {
    await fetch('/api/tasks/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'assign', taskIds: ids, assigneeId: assigneeId ? Number(assigneeId) : null }) });
  }

  return (
    <div className="card">
      <div className="font-semibold mb-2">Bulk Ops</div>
      <div className="flex items-center gap-2 mb-3">
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">Unassigned</option>
          {/* Extend to real producers list later */}
          <option value="1">Producer 1</option>
          <option value="2">Producer 2</option>
        </select>
        <button onClick={assignMany} className="btn-secondary text-xs">Assign</button>
      </div>
      <div className="border rounded-lg">
        {tasks.map(t => (
          <label key={t.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={!!selected[t.id]} onChange={(e) => setSelected(s => ({ ...s, [t.id]: e.target.checked }))} />
              <div className="text-sm">{t.title}</div>
            </div>
            <div className="text-xs text-gray-600">{t.status}</div>
          </label>
        ))}
        {tasks.length === 0 && <div className="p-3 text-sm text-gray-600">No tasks</div>}
      </div>
    </div>
  );
}


