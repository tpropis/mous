"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";

/** Global error boundary for the App Router. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // PRODUCTION: report to an error-tracking service (e.g. Sentry).
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-[70dvh] items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[320px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-rose/15 blur-[120px]" />
      </div>

      <div className="container w-full max-w-md">
        <EmptyState
          icon={AlertTriangle}
          title="Something broke"
          description="An unexpected error interrupted the story. Try again — most of the time that's all it takes."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="brand" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                Try again
              </Button>
              <Button asChild variant="glass">
                <Link href="/feed">Back to the feed</Link>
              </Button>
            </div>
          }
        />
        {error.digest && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
