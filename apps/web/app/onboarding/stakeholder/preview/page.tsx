"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEventSource } from '../../../../hooks/useEventSource';
import { useEffect, useState } from 'react';
import { RubricBreakdown } from '../../../../components/RubricBreakdown';

export default function StakeholderPreview() {
  const params = useSearchParams();
  const ideaId = params.get('ideaId');
  const [progress, setProgress] = useState<{ step?: string; pct?: number }>({ pct: 0 });
  const [criteria, setCriteria] = useState<any[] | undefined>(undefined);
  useEventSource(ideaId ? `/api/events/assessment-idea-${ideaId}` : '', (data) => {
    if (!data?.step) return;
    setProgress({ step: data.step, pct: data.pct });
  });
  useEffect(() => {
    if (!ideaId) return;
    fetch(`/api/ideas/${ideaId}/public`).then(r => r.json()).then((j) => {
      const preview = j?.preview;
      if (preview?.rubric?.criteria) setCriteria(preview.rubric.criteria);
    }).catch(() => {});
  }, [ideaId]);
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
      <div className="card mb-4">
        <h2 className="font-medium mb-2">Rubric sneak peek</h2>
        <RubricBreakdown criteria={criteria} preview={true} />
      </div>
      <div className="card mb-6">
        <h2 className="font-medium mb-2">Access the full plan</h2>
        <p className="text-gray-600">Create your account to see tasks, assign producers, and track progress.</p>
        {ideaId && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-blue-600" style={{ width: `${progress.pct ?? 10}%` }} />
            </div>
            <div className="text-xs text-gray-600 mt-1">{progress.step || 'Processing...'}</div>
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/signin" className="btn-primary text-center">Create account to view plan</Link>
        <Link href="/studio/new" className="btn-secondary text-center">Start another idea</Link>
      </div>
    </div>
  );
}


