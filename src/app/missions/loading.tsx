import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeleton mirroring the missions hero, tabs, and card grid. */
export default function MissionsLoading() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="border-b border-border/60">
        <div className="container py-20 sm:py-28">
          <Skeleton className="mb-6 h-7 w-40 rounded-full" />
          <Skeleton className="h-14 w-full max-w-xl" />
          <Skeleton className="mt-4 h-14 w-3/4 max-w-lg" />
          <Skeleton className="mt-6 h-5 w-full max-w-2xl" />
        </div>
      </section>

      {/* Board */}
      <section className="container py-14">
        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-32 rounded-full" />
          ))}
        </div>

        {/* Mission grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
