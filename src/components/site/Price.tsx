import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  pricePence,
  salePricePence,
  currency = "GBP",
  className,
}: {
  pricePence: number;
  salePricePence: number | null;
  currency?: string;
  className?: string;
}) {
  if (salePricePence != null && salePricePence < pricePence) {
    return (
      <span className={cn("inline-flex items-baseline gap-2", className)}>
        <span className="text-gold">{formatPrice(salePricePence, currency)}</span>
        <s className="text-muted-foreground/70 text-[0.85em]" aria-label={`was ${formatPrice(pricePence, currency)}`}>
          {formatPrice(pricePence, currency)}
        </s>
      </span>
    );
  }
  return <span className={className}>{formatPrice(pricePence, currency)}</span>;
}
