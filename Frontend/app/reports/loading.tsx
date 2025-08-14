import { StatsCardSkeleton } from "@/components/skeletons/card-skeleton"
import { ChartSkeleton, PieChartSkeleton, BarChartSkeleton } from "@/components/skeletons/chart-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReportsLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Detailed insights into your financial data</p>
      </div>

      {/* Toolbar Skeleton */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 mb-6">
        <ChartSkeleton height="h-80" />
        <div className="grid gap-6 md:grid-cols-2">
          <BarChartSkeleton />
          <ChartSkeleton height="h-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <PieChartSkeleton />
          <PieChartSkeleton />
        </div>
      </div>

      {/* Insights Section */}
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
