import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { productQuery } from "@/lib/catalog.queries";
import type { ProductSummary } from "@/lib/catalog-types";
import { LuxeDialog } from "./LuxeDialog";
import { Price } from "./Price";
import { ProductOptions } from "./ProductOptions";
import { SampleBadge } from "./SampleBadge";

export function QuickView({
  product,
  open,
  onOpenChange,
}: {
  product: ProductSummary;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { data, isLoading, isError } = useQuery({ ...productQuery(product.slug), enabled: open });
  return (
    <LuxeDialog open={open} onOpenChange={onOpenChange} title={`Quick view: ${product.name}`} className="max-w-5xl">
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[4/5] bg-muted md:aspect-auto md:min-h-[620px]">
          <img src={product.images[0]} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex flex-col p-7 md:p-10">
          {product.isSample && <SampleBadge className="self-start" />}
          <h2 className="mt-4 font-serif text-4xl leading-tight">{product.name}</h2>
          <Price pricePence={product.pricePence} salePricePence={product.salePricePence} className="mt-3 text-lg" />
          <div className="my-7 h-px bg-border" />
          {isLoading && (
            <div className="space-y-4" aria-label="Loading options">
              <div className="h-9 w-48 rounded-full skeleton-shimmer" />
              <div className="h-11 w-full rounded-full skeleton-shimmer" />
              <div className="h-12 w-full rounded-full skeleton-shimmer" />
            </div>
          )}
          {isError && <p className="text-sm text-destructive">This piece couldn't be loaded. Please try again.</p>}
          {data && <ProductOptions product={data.product} onAdded={() => onOpenChange(false)} />}
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="link-luxe eyebrow mt-auto self-start pt-8 text-primary"
            onClick={() => onOpenChange(false)}
          >
            View full details
          </Link>
        </div>
      </div>
    </LuxeDialog>
  );
}
