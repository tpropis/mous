/** Global route-level loading state: a branded, centered pulse. */
export default function Loading() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-5">
      {/* pulsing ring around the MOUS mark */}
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-primary/30" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neon-violet to-neon-rose text-lg font-black text-white shadow-lg shadow-primary/30">
          M
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-neon-teal ring-2 ring-background" />
        </span>
      </div>
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Loading
      </p>
    </div>
  );
}
