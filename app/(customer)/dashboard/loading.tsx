export default function DashboardLoading() {
  return (
    <div className="px-4 py-5 space-y-6">
      {/* Begrüßung Skeleton */}
      <div>
        <div className="h-7 bg-neutral-200 rounded-lg w-48 animate-pulse" />
        <div className="h-4 bg-neutral-100 rounded w-36 mt-2 animate-pulse" />
      </div>
      {/* Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="card">
            <div className="w-10 h-10 bg-neutral-100 rounded-xl animate-pulse mb-3" />
            <div className="h-4 bg-neutral-100 rounded w-24 animate-pulse mb-1" />
            <div className="h-3 bg-neutral-50 rounded w-32 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
