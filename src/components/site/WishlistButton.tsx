import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/lib/wishlist-store";
import type { ProductSummary } from "@/lib/catalog-types";
import { cn } from "@/lib/utils";

export function WishlistButton({ product, className }: { product: ProductSummary; className?: string }) {
  const saved = useWishlist((s) => s.items.some((i) => i.productId === product.id));
  const toggle = useWishlist((s) => s.toggle);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0] ?? "",
          pricePence: product.pricePence,
          salePricePence: product.salePricePence,
        });
        toast(added ? "Saved to your wishlist" : "Removed from your wishlist");
      }}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/85 text-primary backdrop-blur transition duration-500 ease-luxe hover:scale-110 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4 transition", saved && "fill-gold text-gold")} />
    </button>
  );
}
