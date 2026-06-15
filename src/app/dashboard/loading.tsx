import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeleton mirroring the dashboard greeting, stat row, and sections. */
export default function DashboardLoading() {
  return (
    <div className="container py-10 sm:py-14">
      {/* Greeting */}
      <div className="mb-10 flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-56" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>

      {/* Top story + chart */}
      <div className="mt-14 grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-2xl lg:col-span-3" />
      </div>

      {/* Lower sections */}
      <div className="mt-14 space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
