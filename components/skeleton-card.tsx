export function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-neutral-800" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-neutral-800 rounded w-3/4" />
        <div className="h-4 bg-neutral-800 rounded w-1/2" />
        <div className="flex gap-4">
          <div className="h-4 bg-neutral-800 rounded w-16" />
          <div className="h-4 bg-neutral-800 rounded w-16" />
          <div className="h-4 bg-neutral-800 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
