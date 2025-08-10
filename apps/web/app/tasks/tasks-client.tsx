"use client";
import { useMemo, useState } from 'react';

function badgeFor(status: string) {
  const statusMap: Record<string, string> = {
    todo: 'bg-status-todo/15 text-status-todo',
    in_progress: 'bg-status-progress/15 text-status-progress',
    review: 'bg-status-review/15 text-status-review',
    done: 'bg-status-success/15 text-status-success',
    blocked: 'bg-status-danger/15 text-status-danger',
  };
  return statusMap[status] || 'bg-gray-100 text-gray-700';
}

export default function ClientTasks({ initialTasks }: { initialTasks: any[] }) {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  const grouped = useMemo(() => ({
    todo: tasks.filter((t: any) => t.status === 'todo'),
    in_progress: tasks.filter((t: any) => t.status === 'in_progress'),
    review: tasks.filter((t: any) => t.status === 'review'),
    done: tasks.filter((t: any) => t.status === 'done'),
  }), [tasks]);

  const ids = Object.entries(selected).filter(([_, v]) => v).map(([k]) => Number(k));

  async function bulkStatus(next: string) {
    await Promise.all(ids.map((id) => fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })));
    setTasks(ts => ts.map(t => ids.includes(t.id) ? { ...t, status: next } : t));
    setSelected({});
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">My Tasks</h1>
      <div className="card mb-4">
        <div className="text-sm text-gray-600 mb-2">Bulk status</div>
        <div className="flex items-center gap-2">
          {['todo','in_progress','review','done'].map(s => (
            <button key={s} onClick={() => bulkStatus(s)} className="btn-secondary text-xs capitalize">{s.replace('_',' ')}</button>
          ))}
        </div>
      </div>

      {['todo','in_progress','review','done'].map((s) => (
        <div key={s} className="mb-6">
          <div className="font-semibold mb-2 capitalize">{s.replace('_',' ')}</div>
          {grouped[s as keyof typeof grouped].length === 0 ? (
            <div className="card text-sm text-gray-600">No tasks</div>
          ) : (
            <div className="space-y-2">
              {grouped[s as keyof typeof grouped].map((t: any) => (
                <label key={t.id} className="card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={!!selected[t.id]} onChange={(e) => setSelected(sel => ({ ...sel, [t.id]: e.target.checked }))} />
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badgeFor(t.status)}`}>{t.status}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Due {t.due ? new Date(t.due).toLocaleDateString() : '-'}</div>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


