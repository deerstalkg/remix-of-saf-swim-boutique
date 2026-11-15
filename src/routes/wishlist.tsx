import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useWishlist } from "@/lib/wishlist-store";
import { PageHeading } from "@/components/site/PageHeading";
import { Price } from "@/components/site/Price";
import { ShellMark } from "@/components/site/ShellLogo";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — SAF SWIM BY SUMMER" },
      { name: "description", content: "The SAF SWIM pieces you've saved for later." },
      { property: "og:title", content: "Wishlist — SAF SWIM BY SUMMER" },
      { property: "og:description", content: "Your saved pieces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { items, remove } = useWishlist();
  return (
    <>
      <PageHeading eyebrow="Saved for later" title="Wishlist" />
      <div className="mx-auto max-w-[1500px] px-6 pb-32 md:px-10">
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <ShellMark className="mx-auto h-16 w-16 text-gold" />
            <p className="mt-6 font-serif text-3xl">Nothing saved yet</p>
            <Link to="/shop" className={buttonVariants({ className: "mt-8" })}>Explore collection</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((i) => (
              <article key={i.productId} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-muted">
                  <Link to="/product/$slug" params={{ slug: i.slug }}>
                    <img src={i.image} alt={i.name} className="zoom-img h-full w-full object-cover" loading="lazy" />
                  </Link>
                  <button onClick={() => remove(i.productId)} aria-label={`Remove ${i.name}`} className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/85 transition hover:bg-background">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Link to="/product/$slug" params={{ slug: i.slug }} className="mt-5 block font-serif text-2xl hover:text-gold">{i.name}</Link>
                <Price pricePence={i.pricePence} salePricePence={i.salePricePence} className="text-sm" />
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
