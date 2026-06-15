import { Skeleton } from "@/components/ui/skeleton";

/** Editor skeleton — mirrors the two-column write layout while it hydrates. */
export default function WriteLoading() {
  return (
    <div className="container py-10 sm:py-14">
      <div className="mb-8 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-80 max-w-full" />
        <Skeleton className="h-6 w-full max-w-xl" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-[420px] w-full rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-28 rounded-full" />
            <Skeleton className="h-11 w-28 rounded-full" />
            <Skeleton className="h-11 w-28 rounded-full" />
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
