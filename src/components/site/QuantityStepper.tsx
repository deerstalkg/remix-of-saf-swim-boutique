import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  max = 10,
  min = 1,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  min?: number;
  size?: "sm" | "md";
  label?: string;
}) {
  const btn = cn(
    "inline-flex items-center justify-center rounded-full text-primary transition hover:bg-secondary disabled:opacity-30 disabled:hover:bg-transparent",
    size === "sm" ? "h-8 w-8" : "h-11 w-11",
  );
  return (
    <div className={cn("inline-flex items-center rounded-full border border-border bg-card", size === "sm" ? "h-9 px-0.5" : "h-12 px-1")} role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={cn("text-center font-medium tabular-nums", size === "sm" ? "w-6 text-sm" : "w-10")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
