import Link from "next/link";
import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70dvh] items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-faint bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-30" />
        <div className="absolute left-1/2 top-1/2 h-[360px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-violet/15 blur-[120px]" />
      </div>

      <div className="container flex flex-col items-center text-center">
        <Logo className="mb-8" />
        <span className="text-7xl font-black tracking-tight text-transparent [-webkit-text-stroke:1px_hsl(var(--border))] sm:text-8xl">
          404
        </span>
        <div className="mt-6 w-full max-w-md">
          <EmptyState
            icon={Ghost}
            title="This page doesn't exist"
            description="The story you were looking for slipped into the dark. Plenty more where that came from."
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="brand">
                  <Link href="/feed">Read the feed</Link>
                </Button>
                <Button asChild variant="glass">
                  <Link href="/">Back home</Link>
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
