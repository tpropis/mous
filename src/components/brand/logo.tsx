import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * MOUS wordmark. The "O" is rendered as a hollow ring — a nod to the
 * anonymous "no face" identity.
 */
export function Logo({
  className,
  href = "/",
  showTagline = false,
}: {
  className?: string;
  href?: string;
  showTagline?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2", className)}
      aria-label="MOUS home"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon-violet to-neon-rose text-sm font-black text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
        M
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-neon-teal ring-2 ring-background" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-black tracking-tight text-foreground">
          M<span className="text-gradient-brand">O</span>US
        </span>
        {showTagline && (
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Stories without names
          </span>
        )}
      </span>
    </Link>
  );
}
