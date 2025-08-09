export default function ProjectBoard({ params }: { params: { id: string } }) {
  return (
    <main style={{ padding: 24 }}>
      <h2>Project Board — {params.id}</h2>
      <p>Phases → Checkpoints → Tasks (drag & drop, real-time) — to be implemented in Cursor.</p>
      <ul>
        <li>Phase 1 ▸ Checkpoint 1.1 ▸ Task: Scaffold repo</li>
        <li>Phase 1 ▸ Checkpoint 1.1 ▸ Task: Design tokens</li>
        <li>Phase 1 ▸ Checkpoint 1.1 ▸ Task: Board MVP</li>
      </ul>
    </main>
  );
}
