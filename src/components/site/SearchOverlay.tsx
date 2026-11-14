import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { Search, X, ArrowRight } from "lucide-react";
import { categoriesQuery, productsQuery } from "@/lib/catalog.queries";
import { Price } from "./Price";

export function SearchOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(t);
  }, [term]);
  useEffect(() => {
    if (!open) setTerm("");
  }, [open]);

  const { data: results, isFetching } = useQuery({
    ...productsQuery({ search: debounced, limit: 6 }),
    enabled: open && debounced.length >= 2,
  });
  const { data: categories } = useQuery({ ...categoriesQuery(), enabled: open });
  const close = () => onOpenChange(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-x-0 top-0 z-50 max-h-[90vh] overflow-y-auto rounded-b-[2.5rem] bg-background shadow-lift duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top">
          <DialogPrimitive.Title className="sr-only">Search the boutique</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Search pieces by name</DialogPrimitive.Description>
          <div className="mx-auto max-w-5xl px-6 pb-12 pt-10">
            <div className="flex items-center gap-4 border-b border-primary/30 pb-4">
              <Search className="h-6 w-6 text-gold" />
              <input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search swimwear, linen, accessories…"
                aria-label="Search products"
                className="flex-1 bg-transparent font-serif text-3xl outline-none placeholder:text-muted-foreground/60 md:text-5xl"
              />
              <DialogPrimitive.Close className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-secondary" aria-label="Close search">
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>

            {debounced.length < 2 ? (
              <div className="mt-8">
                <p className="eyebrow text-muted-foreground">Browse</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(categories ?? []).map((c) => (
                    <Link key={c.slug} to="/shop" search={{ category: c.slug }} onClick={close} className="rounded-full border border-border px-5 py-2 text-sm transition hover:border-primary hover:bg-primary hover:text-primary-foreground">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <p className="eyebrow text-muted-foreground" aria-live="polite">
                  {isFetching ? "Searching…" : `${results?.length ?? 0} results`}
                </p>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(results ?? []).map((p) => (
                    <li key={p.id}>
                      <Link to="/product/$slug" params={{ slug: p.slug }} onClick={close} className="group flex items-center gap-4 rounded-2xl p-2 transition hover:bg-card">
                        <img src={p.images[0]} alt="" className="h-20 w-16 rounded-xl object-cover" loading="lazy" />
                        <div>
                          <p className="font-serif text-xl leading-tight group-hover:text-gold">{p.name}</p>
                          <Price pricePence={p.pricePence} salePricePence={p.salePricePence} className="text-sm" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                {!isFetching && results?.length === 0 && (
                  <p className="mt-4 text-muted-foreground">Nothing matches "{debounced}" yet.</p>
                )}
                <Link to="/shop" onClick={close} className="link-luxe eyebrow mt-8 inline-flex items-center gap-2 text-primary">
                  View all pieces <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
