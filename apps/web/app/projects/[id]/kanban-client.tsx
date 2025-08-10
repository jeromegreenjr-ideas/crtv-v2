"use client";
import { useEffect, useState } from 'react';

type Column = { id: number; name: string };
type Task = { id: number; title: string; checkpointId: number; status: string };

export default function KanbanClient({ projectId, initialColumns }: { projectId: number; initialColumns: Column[] }) {
  const [columns, setColumns] = useState<Column[]>(initialColumns || []);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/tasks`).then(r => r.json()).then(j => setTasks(j.tasks || []));
    // Columns provided by server
  }, [projectId]);

  function onDrop(e: React.DragEvent<HTMLDivElement>, toCheckpointId: number) {
    const id = Number(e.dataTransfer.getData('text/plain'));
    if (!Number.isFinite(id)) return;
    setTasks(ts => ts.map(t => t.id === id ? { ...t, checkpointId: toCheckpointId } : t));
    fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checkpointId: toCheckpointId }) });
  }

  return (
    <div className="grid md:grid-cols-3 gap-3" role="list" aria-label="Kanban columns">
      {columns.map(col => (
        <div key={col.id} className="border rounded-xl p-2 min-h-[200px]" role="listitem" aria-label={col.name} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, col.id)}>
          <div className="font-semibold mb-2">{col.name}</div>
          {tasks.filter(t => t.checkpointId === col.id).map(t => (
            <div key={t.id} className="card mb-2" role="button" tabIndex={0} aria-label={`Task ${t.title}`} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', String(t.id))} onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                const idx = columns.findIndex(c => c.id === col.id);
                const next = columns[idx + 1];
                if (next) onDrop({ dataTransfer: { getData: () => String(t.id) } } as any, next.id);
              }
              if (e.key === 'ArrowLeft') {
                const idx = columns.findIndex(c => c.id === col.id);
                const prev = columns[idx - 1];
                if (prev) onDrop({ dataTransfer: { getData: () => String(t.id) } } as any, prev.id);
              }
            }}>
              <div className="text-sm font-medium">{t.title}</div>
            </div>
          ))}
        </div>
      ))}
      {columns.length === 0 && (
        <div className="text-sm text-gray-600">Kanban columns will appear when checkpoints are available.</div>
      )}
    </div>
  );
}


