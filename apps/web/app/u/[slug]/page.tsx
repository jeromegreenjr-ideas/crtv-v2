import { getProducerProfileBySlug, getLatestProducerAssessment, getUploadsByUser } from '../../../lib/data';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PublicProducerProfile({ params }: { params: { slug: string } }) {
  const profile = await getProducerProfileBySlug(params.slug);
  if (!profile || profile.isPublic === false) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="card text-center">
          <h1 className="text-xl font-semibold mb-2">Profile not available</h1>
          <p className="text-gray-600">This producer profile is private or does not exist.</p>
        </div>
      </div>
    );
  }

  const assessment = await getLatestProducerAssessment(profile.userId);
  const uploads = await getUploadsByUser(profile.userId, 'producerSample', 12);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{profile.displayName || profile.username}</h1>
          <p className="text-gray-600">{profile.category} · CRTV Tier {profile.crtvTier ?? '-'}</p>
        </div>
        <Link href={`mailto:contact@crtv.studio?subject=Work with ${encodeURIComponent(profile.displayName || profile.username)}`} className="btn-primary">Work with me</Link>
      </header>

      {assessment?.categories && (
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(assessment.categories).slice(0, 6).map(([k, v]: any) => (
            <span key={k} className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">{k}: {v}</span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {uploads.map((u: any) => (
          <a key={u.id} href={u.url} target="_blank" className="block aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            {/* Placeholder without image proxying; real impl would handle images/videos */}
            <div className="w-full h-full grid place-items-center text-gray-500 text-sm">Sample</div>
          </a>
        ))}
      </div>
    </div>
  );
}


