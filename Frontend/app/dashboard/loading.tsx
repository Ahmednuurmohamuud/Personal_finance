import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton"

export default function DashboardLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your financial status</p>
      </div>
      <DashboardSkeleton />
    </div>
  )
}
