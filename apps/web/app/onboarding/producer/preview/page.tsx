import Link from 'next/link';

export default function ProducerPreview() {
  return (
    <div className="min-h-screen max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Preview your assessment</h1>
      <div className="card mb-4">
        <h2 className="font-medium mb-2">Tier & score</h2>
        <p className="text-gray-600">We’ve generated a preliminary tier and category scores from your links.</p>
      </div>
      <div className="card mb-4">
        <h2 className="font-medium mb-2">Profile preview</h2>
        <p className="text-gray-600">Your modular profile is ready. Create your account to edit and publish.</p>
      </div>
      <div className="card mb-6">
        <h2 className="font-medium mb-2">Unlock full insight</h2>
        <p className="text-gray-600">Sign in to view detailed insights, recommendations, and opportunities.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/signin" className="btn-primary text-center">Create account to view assessment</Link>
        <Link href="/onboarding/producer" className="btn-secondary text-center">Resubmit links</Link>
      </div>
    </div>
  );
}


