import Link from "next/link";
import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";

export default function ProfileNotFound() {
  return (
    <div className="container flex min-h-[60dvh] items-center justify-center py-16">
      <EmptyState
        className="max-w-md"
        icon={Ghost}
        title="No one here"
        description="This anonymous writer doesn't exist — or never did. That's rather on brand."
        action={
          <Button asChild variant="brand">
            <Link href="/feed">Browse the feed</Link>
          </Button>
        }
      />
    </div>
  );
}
