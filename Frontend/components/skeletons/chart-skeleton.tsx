import { Skeleton } from "@/components/ui/skeleton"

export function ChartSkeleton({ height = "h-80" }: { height?: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded" />
      </div>
      <Skeleton className={`w-full rounded ${height}`} />
    </div>
  )
}

export function PieChartSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="h-6 w-32 mb-6" />
      <div className="flex items-center justify-center">
        <Skeleton className="h-64 w-64 rounded-full" />
      </div>
    </div>
  )
}

export function BarChartSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="h-6 w-32 mb-6" />
      <div className="flex items-end justify-between gap-2 h-64">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="w-full rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }} />
        ))}
      </div>
    </div>
  )
}
