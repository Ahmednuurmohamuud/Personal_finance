import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function ArchiveLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Skeleton className="h-10 w-32 mb-2" />
        <h1 className="text-3xl font-bold">Archived Items</h1>
        <p className="text-muted-foreground">View and manage your archived financial data</p>
      </div>

      {/* Toolbar Skeleton */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-10 w-64" />
      </div>

      <TableSkeleton rows={6} columns={5} />
    </div>
  )
}
