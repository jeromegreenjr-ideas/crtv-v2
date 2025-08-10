import { Skeleton } from '../../components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card">
            <Skeleton className="h-5 w-1/2 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}


