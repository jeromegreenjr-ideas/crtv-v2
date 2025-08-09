import Link from "next/link";
export default function Home() {
  return (
    <main style={{ padding: 32 }}>
      <h1>CRTV Studio</h1>
      <p>Streamline idea development: idea → brief → phases → checkpoints → tasks.</p>
      <nav style={{ display: "flex", gap: 16, marginTop: 16 }}>
        <Link href="/studio/new">Start in Studio</Link>
        <Link href="/projects/demo">View Project Board (demo)</Link>
      </nav>
    </main>
  );
}
