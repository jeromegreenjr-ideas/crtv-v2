import { getIdeaPublic } from '../../../lib/data';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function IdeaPublicPage({ params }: { params: { id: string } }) {
  const ideaId = Number(params.id);
  const pack = await getIdeaPublic(ideaId);
  if (!pack?.idea) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="card text-center">
          <h1 className="text-xl font-semibold mb-2">Idea not found</h1>
          <p className="text-gray-600">This idea preview is not available.</p>
        </div>
      </div>
    );
  }
  const preview: any = pack.preview || {};
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">{pack.profile?.title || pack.idea.title || 'Idea'}</h1>
        <p className="text-gray-700">{pack.profile?.overview || pack.idea.summary}</p>
      </header>

      <section className="grid sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold">{preview.overallScore ?? '-'}</div>
          <div className="text-gray-600">Overall Score</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold">{preview.phases ?? preview?.metrics?.phases ?? 5}</div>
          <div className="text-gray-600">Phases</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold">{preview.tasksCount ?? preview?.metrics?.tasksCount ?? 0}</div>
          <div className="text-gray-600">Tasks</div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold mb-2">Timeline</h2>
        <p className="text-gray-700">{preview.estTimeline ?? preview?.metrics?.timeline ?? 'To be estimated'}</p>
      </section>

      <div className="flex gap-3">
        <Link href={`/onboarding/stakeholder`} className="btn-primary">Collaborate / Request to Join</Link>
      </div>
    </div>
  );
}


