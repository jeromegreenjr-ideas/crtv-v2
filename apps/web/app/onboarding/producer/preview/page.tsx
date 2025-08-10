"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEventSource } from '../../../../hooks/useEventSource';
import { useState } from 'react';

export default function ProducerPreview() {
  const params = useSearchParams();
  const userId = params.get('userId');
  const [progress, setProgress] = useState<{ step?: string; pct?: number }>({ pct: 0 });
  useEventSource(userId ? `/api/events/assessment-producer-${userId}` : '', (data) => {
    if (!data?.step) return;
    setProgress({ step: data.step, pct: data.pct });
  });
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
        {userId && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-blue-600" style={{ width: `${progress.pct ?? 10}%` }} />
            </div>
            <div className="text-xs text-gray-600 mt-1">{progress.step || 'Processing...'}</div>
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/signin" className="btn-primary text-center">Create account to view assessment</Link>
        <Link href="/onboarding/producer" className="btn-secondary text-center">Resubmit links</Link>
      </div>
    </div>
  );
}


