import type { ReactNode } from "react";
import type { CartLine } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export function OrderSummary({
  lines,
  subtotalPence,
  shippingPence,
  shippingLabel,
  children,
}: {
  lines: CartLine[];
  subtotalPence: number;
  shippingPence: number | null;
  shippingLabel?: string | undefined;
  children?: ReactNode;
}) {
  return (
    <aside className="rounded-[2rem] border border-border bg-card p-7 shadow-soft md:p-9" aria-labelledby="summary-title">
      <h2 id="summary-title" className="font-serif text-3xl">Order summary</h2>
      <ul className="mt-6 space-y-4 border-b border-border pb-6">
        {lines.map((l) => (
          <li key={l.key} className="flex gap-4">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
              <img src={l.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold text-primary-foreground">{l.quantity}</span>
            </div>
            <div className="flex-1 text-sm">
              <p className="font-serif text-lg leading-tight">{l.name}</p>
              <p className="text-xs text-muted-foreground">{[l.colour, l.size].filter(Boolean).join(" · ")}</p>
            </div>
            <p className="text-sm font-medium">{formatPrice(l.unitPricePence * l.quantity)}</p>
          </li>
        ))}
      </ul>
      <dl className="space-y-3 py-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatPrice(subtotalPence)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery{shippingLabel ? ` · ${shippingLabel}` : ""}</dt>
          <dd>{shippingPence == null ? "Calculated next" : shippingPence === 0 ? "Complimentary" : formatPrice(shippingPence)}</dd>
        </div>
      </dl>
      <div className="flex items-baseline justify-between border-t border-border pt-6">
        <span className="eyebrow">Total</span>
        <span className="font-serif text-3xl">{formatPrice(subtotalPence + (shippingPence ?? 0))}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Prices include VAT where applicable.</p>
      {children}
    </aside>
  );
}
