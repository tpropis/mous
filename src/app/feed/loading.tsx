import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeleton mirroring the feed's header, controls, and card grid. */
export default function FeedLoading() {
  return (
    <div className="container py-10 sm:py-14">
      {/* Header */}
      <div className="mb-8 max-w-2xl space-y-3">
        <Skeleton className="h-7 w-56 rounded-full" />
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>

      {/* Sort pills */}
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      {/* Search + actions */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-11 flex-1 rounded-full" />
        <Skeleton className="h-11 w-28 rounded-full" />
        <Skeleton className="h-11 w-36 rounded-full" />
      </div>

      {/* Card grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
