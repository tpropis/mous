import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Emotional call-to-action inviting the reader to write their own story.
 * Server component — purely presentational.
 */
export function WriteYourVersion() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-neon-violet/15 via-background to-neon-rose/10 px-6 py-12 text-center sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:40px_40px] opacity-20" />
      <div className="relative mx-auto max-w-xl">
        <h2 className="text-balance text-3xl font-black tracking-tight sm:text-4xl">
          Everyone has a story.
          <span className="text-gradient-brand"> Write yours.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          This one stayed with you. So will the one you're still carrying. Tell it
          here — no name, no face, just the truth.
        </p>
        <Button asChild variant="brand" size="lg" className="group mt-8">
          <Link href="/write">
            <PenLine className="h-5 w-5" />
            Write your version
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
