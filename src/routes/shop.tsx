import type * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { categoriesQuery, collectionsQuery, productsQuery } from "@/lib/catalog.queries";
import { ProductCard, ProductGridSkeleton } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { SampleNotice } from "@/components/site/SampleBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  category: z.string().max(60).optional().catch(undefined),
  collection: z.string().max(80).optional().catch(undefined),
  sort: z.enum(["featured", "newest", "price-asc", "price-desc"]).optional().catch(undefined),
});

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop Swimwear, Resort Dresses & Accessories — SAF SWIM BY SUMMER" },
      { name: "description", content: "Shop coastal luxury swimwear, linen, cover-ups, dresses and accessories. Filter by category and collection, sort by price or newest arrivals." },
      { property: "og:title", content: "Shop — SAF SWIM BY SUMMER" },
      { property: "og:description", content: "Coastal luxury swimwear, linen and resort pieces by Summer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loaderDeps: ({ search }) => ({ category: search.category, collection: search.collection, sort: search.sort }),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery()),
      context.queryClient.ensureQueryData(collectionsQuery()),
      context.queryClient.ensureQueryData(productsQuery(deps)),
    ]),
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const { data: collections } = useSuspenseQuery(collectionsQuery());
  const filters = { category: search.category, collection: search.collection, sort: search.sort };
  const { data: products, isPending } = useQuery({ ...productsQuery(filters), placeholderData: (prev) => prev });
  const activeCategory = categories.find((c) => c.slug === search.category);
  const activeCollection = collections.find((c) => c.slug === search.collection);

  const set = (patch: Partial<typeof search>) => navigate({ search: (prev) => ({ ...prev, ...patch }), resetScroll: false });

  return (
    <>
      <section className="relative h-[52vh] min-h-[380px] overflow-hidden bg-ocean-night text-ivory">
        <img src="/images/shoreline-wide.jpg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover animate-ken-burns" width={1920} height={1088} />
        <div className="absolute inset-0 bg-overlay" />
        <div className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-end px-6 pb-14 md:px-10">
          <Reveal>
            <p className="eyebrow text-sand">The Boutique</p>
            <h1 className="display-xl mt-4">{activeCategory?.name ?? activeCollection?.name ?? "Shop All"}</h1>
          </Reveal>
        </div>
      </section>

      <div className="sticky top-[88px] z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-6 py-4 md:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:pb-0" role="tablist" aria-label="Categories">
            <FilterPill active={!search.category} onClick={() => set({ category: undefined })}>All</FilterPill>
            {categories.map((c) => (
              <FilterPill key={c.slug} active={search.category === c.slug} onClick={() => set({ category: c.slug })}>
                {c.name}
              </FilterPill>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={search.collection ?? "all"} onValueChange={(v) => set({ collection: v === "all" ? undefined : v })}>
              <SelectTrigger className="h-11 w-[200px] rounded-full bg-card px-5" aria-label="Filter by collection">
                <SelectValue placeholder="All collections" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">All collections</SelectItem>
                {collections.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={search.sort ?? "featured"} onValueChange={(v) => set({ sort: v === "featured" ? undefined : (v as (typeof SORTS)[number]["value"]) })}>
              <SelectTrigger className="h-11 w-[200px] rounded-full bg-card px-5" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1500px] px-6 py-14 md:px-10 md:py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="eyebrow text-muted-foreground" aria-live="polite">
            {products ? `${products.length} ${products.length === 1 ? "piece" : "pieces"}` : "Loading"}
          </p>
          <SampleNotice />
        </div>
        {isPending && !products ? (
          <ProductGridSkeleton count={8} />
        ) : products && products.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.7, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductCard product={p} eager={i < 4} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-serif text-4xl">No pieces here yet</p>
            <p className="mt-3 text-muted-foreground">Try another category or collection.</p>
            <Link to="/shop" className="link-luxe eyebrow mt-8 inline-block">Clear filters</Link>
          </div>
        )}
      </section>
    </>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] transition duration-500 ease-luxe",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary",
      )}
    >
      {children}
    </button>
  );
}
