import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeleton mirroring the explore hero, category grid, and rails. */
export default function ExploreLoading() {
  return (
    <div className="relative">
      {/* Hero */}
      <div className="border-b border-border/60">
        <div className="container space-y-4 py-16 sm:py-20">
          <Skeleton className="h-7 w-72 rounded-full" />
          <Skeleton className="h-14 w-full max-w-2xl" />
          <Skeleton className="h-6 w-full max-w-xl" />
        </div>
      </div>

      {/* Category grid */}
      <div className="container py-16">
        <div className="mb-10 space-y-2">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-9 w-80" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Moods rail */}
      <div className="border-y border-border/60 bg-card/20 py-16">
        <div className="container">
          <Skeleton className="mb-8 h-9 w-72" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-32 shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Top writers */}
      <div className="container py-16">
        <Skeleton className="mb-10 h-9 w-56" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
