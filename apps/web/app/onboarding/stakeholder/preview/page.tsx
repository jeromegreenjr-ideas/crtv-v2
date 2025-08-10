import Link from 'next/link';

export default function StakeholderPreview() {
  return (
    <div className="min-h-screen max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Preview your AI-generated plan</h1>
      <div className="card mb-4">
        <h2 className="font-medium mb-2">Brief snapshot</h2>
        <p className="text-gray-600">We’ve generated a concise overview and objectives for your idea.</p>
      </div>
      <div className="card mb-4">
        <h2 className="font-medium mb-2">Phases & checkpoints</h2>
        <p className="text-gray-600">A 5-phase plan with 3–5 checkpoints per phase is ready.</p>
      </div>
      <div className="card mb-6">
        <h2 className="font-medium mb-2">Access the full plan</h2>
        <p className="text-gray-600">Create your account to see tasks, assign producers, and track progress.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/signin" className="btn-primary text-center">Create account to view plan</Link>
        <Link href="/studio/new" className="btn-secondary text-center">Start another idea</Link>
      </div>
    </div>
  );
}


