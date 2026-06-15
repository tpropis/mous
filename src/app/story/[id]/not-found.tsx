import Link from "next/link";
import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";

/** Friendly fallback when a story id doesn't resolve. */
export default function StoryNotFound() {
  return (
    <div className="container flex min-h-[60vh] max-w-2xl items-center py-20">
      <EmptyState
        className="w-full"
        icon={Ghost}
        title="This story slipped into the dark"
        description="It may have been removed, or the link is no longer valid. Plenty of other stories are waiting to be read."
        action={
          <Button asChild variant="brand">
            <Link href="/feed">Back to the feed</Link>
          </Button>
        }
      />
    </div>
  );
}
