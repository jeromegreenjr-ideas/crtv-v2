import { Skeleton } from '../../components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2 w-full mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}


