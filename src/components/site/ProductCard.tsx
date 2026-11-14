import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductSummary } from "@/lib/catalog-types";
import { cn } from "@/lib/utils";
import { Price } from "./Price";
import { QuickView } from "./QuickView";
import { SampleBadge } from "./SampleBadge";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ product, className, eager = false }: { product: ProductSummary; className?: string; eager?: boolean }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [primary, secondary] = product.images;
  const onSale = product.salePricePence != null && product.salePricePence < product.pricePence;

  return (
    <article className={cn("group flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-muted">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block aspect-[4/5]" aria-label={product.name}>
          <img
            src={primary}
            alt={product.name}
            width={1024}
            height={1280}
            loading={eager ? "eager" : "lazy"}
            className={cn("zoom-img absolute inset-0 h-full w-full object-cover", secondary && "group-hover:opacity-0")}
          />
          {secondary && (
            <img
              src={secondary}
              alt=""
              aria-hidden="true"
              width={1024}
              height={1280}
              loading="lazy"
              className="zoom-img absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100"
            />
          )}
        </Link>
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-2">
          {product.isSample && <SampleBadge />}
          {onSale && (
            <span className="rounded-full bg-gold px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-pearl">Sale</span>
          )}
          {product.isNew && !onSale && (
            <span className="rounded-full bg-primary px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-primary-foreground">New</span>
          )}
        </div>
        <WishlistButton product={product} className="absolute right-4 top-4" />
        <div className="absolute inset-x-4 bottom-4 flex translate-y-0 gap-2 opacity-100 transition duration-700 ease-luxe md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          <Button variant="hero" size="sm" className="flex-1" onClick={() => setQuickOpen(true)}>
            <Eye /> Quick view
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-5">
        <div className="flex items-start justify-between gap-4">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="font-serif text-2xl leading-tight transition hover:text-gold">
            {product.name}
          </Link>
          <Price pricePence={product.pricePence} salePricePence={product.salePricePence} className="shrink-0 pt-1 text-sm font-medium" />
        </div>
        {product.colours.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5" aria-label={`Colours: ${product.colours.map((c) => c.name).join(", ")}`}>
            {product.colours.map((c) => (
              <span key={c.name} className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: c.hex }} title={c.name} />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">
              {product.colours.length} {product.colours.length === 1 ? "colour" : "colours"}
            </span>
          </div>
        )}
        <Button variant="outline" size="sm" className="mt-5 self-start" onClick={() => setQuickOpen(true)}>
          <ShoppingBag /> Add to Bag
        </Button>
      </div>

      <QuickView product={product} open={quickOpen} onOpenChange={setQuickOpen} />
    </article>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] rounded-[1.75rem] skeleton-shimmer" />
          <div className="mt-5 h-6 w-2/3 rounded-full skeleton-shimmer" />
          <div className="mt-3 h-4 w-1/3 rounded-full skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}
