import { Skeleton } from '../../components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card">
            <Skeleton className="h-5 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-2 w-full mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}


