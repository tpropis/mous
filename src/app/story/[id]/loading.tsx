import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton reading view shown while the story loads. */
export default function StoryLoading() {
  return (
    <div className="container max-w-3xl pb-24 pt-10 sm:pt-16">
      {/* badges */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* title */}
      <div className="mt-5 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </div>

      {/* meta row */}
      <div className="mt-6 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>

      <Skeleton className="my-8 h-px w-full" />

      {/* body */}
      <div className="mx-auto max-w-2xl space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4 w-full"
            style={{ width: i % 3 === 2 ? "70%" : "100%" }}
          />
        ))}
      </div>

      {/* reactions */}
      <div className="mt-12 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    </div>
  );
}
