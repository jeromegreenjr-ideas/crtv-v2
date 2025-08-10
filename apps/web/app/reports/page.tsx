import { getAllIdeas, getIdeaWithAssessment } from '../../lib/data';
import { RubricBreakdown } from '../../components/RubricBreakdown';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const ideas = await getAllIdeas();
  const packs = await Promise.all(ideas.map((i: any) => getIdeaWithAssessment(i.id)));
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Reports</h1>
      {packs.length === 0 ? (
        <div className="card">No ideas yet.</div>
      ) : (
        <div className="space-y-4">
          {packs.map((p: any) => (
            <div key={p.idea.id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{p.idea.title || p.idea.summary?.slice(0, 60)}</h2>
                  <div className="text-sm text-gray-600">Status: {p.idea.status}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{p.assessment?.overallScore ?? '-'}</div>
                  <div className="text-gray-600 text-sm">Overall</div>
                </div>
              </div>
              {p.assessment?.rubric?.criteria && (
                <div className="mt-3">
                  <RubricBreakdown criteria={p.assessment.rubric.criteria} preview={true} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


