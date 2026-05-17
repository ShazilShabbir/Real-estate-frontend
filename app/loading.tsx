import { SkeletonGrid } from "@/components/skeleton-card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SkeletonGrid count={6} />
      </div>
    </div>
  )
}
