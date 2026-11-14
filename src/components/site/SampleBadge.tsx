import { cn } from "@/lib/utils";

export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-gold/50 bg-background/85 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-gold backdrop-blur",
        className,
      )}
      title="Sample product — to be replaced with the real catalogue"
    >
      Sample
    </span>
  );
}

export function SampleNotice({ className }: { className?: string }) {
  return (
    <p className={cn("rounded-full border border-gold/40 bg-card px-5 py-2.5 text-center text-xs text-muted-foreground", className)}>
      You're viewing <span className="text-gold">sample pieces</span> — Summer's real catalogue is coming soon.
    </p>
  );
}
