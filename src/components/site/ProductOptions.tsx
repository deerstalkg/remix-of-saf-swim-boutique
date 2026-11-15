import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import type { ProductDetail } from "@/lib/catalog-types";
import { cn } from "@/lib/utils";
import { QuantityStepper } from "./QuantityStepper";

export function ProductOptions({
  product,
  onAdded,
  initialColour,
  onColourChange,
}: {
  product: ProductDetail;
  onAdded?: () => void;
  initialColour?: string;
  onColourChange?: (c: string) => void;
}) {
  const add = useCart((s) => s.add);
  const [colour, setColour] = useState<string | null>(initialColour ?? product.colours[0]?.name ?? null as string | null);
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const hasVariants = product.variants.length > 0;
  const stockFor = (c: string | null, s: string | null) =>
    hasVariants ? (product.variants.find((v) => v.colour === c && v.size === s)?.stock ?? 0) : 10;
  const stock = size ? stockFor(colour, size) : null;
  const maxQty = Math.max(1, Math.min(10, stock ?? 10));
  const soldOut = stock === 0;
  const allSoldOut = useMemo(
    () => hasVariants && product.variants.every((v) => v.stock === 0),
    [hasVariants, product.variants],
  );

  const handleAdd = () => {
    if (product.sizes.length > 0 && !size) {
      setError("Please choose a size.");
      return;
    }
    if (soldOut) return;
    setError(null);
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0] ?? "",
        colour,
        size,
        unitPricePence: product.salePricePence ?? product.pricePence,
        maxQuantity: stock ?? 10,
      },
      Math.min(qty, maxQty),
    );
    toast.success(`${product.name} added to your bag`);
    onAdded?.();
  };

  return (
    <div className="space-y-7">
      {product.colours.length > 0 && (
        <fieldset>
          <legend className="eyebrow mb-3 text-muted-foreground">
            Colour — <span className="text-primary">{colour}</span>
          </legend>
          <div className="flex flex-wrap gap-3">
            {product.colours.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                aria-pressed={colour === c.name}
                onClick={() => {
                  setColour(c.name);
                  onColourChange?.(c.name);
                }}
                className={cn(
                  "h-9 w-9 rounded-full border border-border p-1 transition duration-500 ease-luxe hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  colour === c.name && "ring-1 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                <span className="block h-full w-full rounded-full" style={{ backgroundColor: c.hex }} />
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {product.sizes.length > 0 && (
        <fieldset>
          <legend className="eyebrow mb-3 text-muted-foreground">
            Size {size && <>— <span className="text-primary">{size}</span></>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const out = hasVariants && stockFor(colour, s) === 0;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={size === s}
                  disabled={out}
                  onClick={() => {
                    setSize(s);
                    setError(null);
                    setQty(1);
                  }}
                  className={cn(
                    "h-11 min-w-14 rounded-full border px-5 text-sm font-medium transition duration-500 ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    size === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary",
                    out && "cursor-not-allowed text-muted-foreground/50 line-through hover:border-border",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {stock !== null && stock > 0 && stock <= 3 && (
            <p className="mt-3 text-sm text-gold">Only {stock} left in this size</p>
          )}
          {soldOut && <p className="mt-3 text-sm text-muted-foreground">Sold out in this colour and size</p>}
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} max={maxQty} />
        <Button onClick={handleAdd} size="lg" className="flex-1" disabled={soldOut || allSoldOut}>
          <ShoppingBag />
          {allSoldOut ? "Sold out" : "Add to Bag"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
