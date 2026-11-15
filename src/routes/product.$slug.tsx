import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Truck, RotateCcw, Sparkles } from "lucide-react";
import { productQuery } from "@/lib/catalog.queries";
import { DELIVERY_COPY } from "@/lib/site-config";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductOptions } from "@/components/site/ProductOptions";
import { ProductCard } from "@/components/site/ProductCard";
import { Price } from "@/components/site/Price";
import { Reveal } from "@/components/site/Reveal";
import { SampleBadge } from "@/components/site/SampleBadge";
import { WishlistButton } from "@/components/site/WishlistButton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.slug)),
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Unavailable — SAF SWIM BY SUMMER" }, { name: "robots", content: "noindex" }] };
    const title = `${p.name} — SAF SWIM BY SUMMER`;
    const description = p.description.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="py-40 text-center">
      <p className="font-serif text-4xl">This piece isn't available</p>
      <Link to="/shop" className="link-luxe eyebrow mt-8 inline-block">Back to the boutique</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="py-40 text-center">
      <p className="font-serif text-4xl">This piece couldn't be loaded</p>
      <Link to="/shop" className="link-luxe eyebrow mt-8 inline-block">Back to the boutique</Link>
    </div>
  ),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const { product, collection, related } = data;
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const images = product.images.length ? product.images : [""];

  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-[1500px] px-6 pt-10 md:px-10">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <li><Link to="/" className="hover:text-primary">Home</Link></li>
          <ChevronRight className="h-3 w-3" />
          <li><Link to="/shop" className="hover:text-primary">Shop</Link></li>
          {collection && (
            <>
              <ChevronRight className="h-3 w-3" />
              <li><Link to="/collections/$slug" params={{ slug: collection.slug }} className="hover:text-primary">{collection.name}</Link></li>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <li aria-current="page" className="text-primary">{product.name}</li>
        </ol>
      </nav>

      <section className="mx-auto grid max-w-[1500px] gap-12 px-6 py-10 md:px-10 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex gap-3 md:flex-col" role="tablist" aria-label="Product images">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                role="tab"
                aria-selected={active === i}
                aria-label={`Show image ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-24 w-20 overflow-hidden rounded-2xl border-2 transition duration-500 md:h-28 md:w-24",
                  active === i ? "border-gold" : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div
            className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-[2rem] bg-muted"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                src={images[active] ?? ""}
                alt={`${product.name} — image ${active + 1}`}
                width={1024}
                height={1280}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: zoom ? 1.8 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: zoom ? 0.3 : 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            {product.isSample && <SampleBadge className="absolute left-5 top-5" />}
            <WishlistButton product={product} className="absolute right-5 top-5" />
          </div>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            {collection && <p className="eyebrow text-gold">{collection.name}</p>}
            <h1 className="display-md mt-3">{product.name}</h1>
            <Price pricePence={product.pricePence} salePricePence={product.salePricePence} className="mt-4 text-xl" />
            <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>
            <div className="my-8 h-px bg-border" />
            <ProductOptions
              product={product}
              onColourChange={(c) => {
                const idx = product.colours.findIndex((x) => x.name === c);
                if (idx >= 0 && idx < images.length) setActive(idx % images.length);
              }}
            />
            <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-gold" /> Free UK over £150</li>
              <li className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-gold" /> 14-day returns</li>
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-gold" /> Gift wrapped</li>
            </ul>
            <Accordion type="single" collapsible defaultValue="details" className="mt-10 border-t border-border">
              <AccordionItem value="details">
                <AccordionTrigger className="eyebrow py-5 hover:no-underline">Product information</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                    {product.details.map((d) => <li key={d}>{d}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger className="eyebrow py-5 hover:no-underline">Care</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                    {product.care.map((d) => <li key={d}>{d}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="delivery">
                <AccordionTrigger className="eyebrow py-5 hover:no-underline">Delivery & returns</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>{DELIVERY_COPY.delivery}</p>
                  <p>{DELIVERY_COPY.returns}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1500px] px-6 py-24 md:px-10" aria-labelledby="related-title">
          <Reveal>
            <p className="eyebrow text-gold">Complete the look</p>
            <h2 id="related-title" className="display-md mt-3">You may also love</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
