import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart, useCartHydrated } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { calculateShipping, calculateSubtotal, COUNTRIES, shippingMethodsFor, UK_COUNTRY_CODE } from "@/lib/shipping";
import { QuantityStepper } from "@/components/site/QuantityStepper";
import { OrderSummary } from "@/components/site/OrderSummary";
import { PageHeading } from "@/components/site/PageHeading";
import { ShellMark } from "@/components/site/ShellLogo";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — SAF SWIM BY SUMMER" },
      { name: "description", content: "Review the pieces in your bag, update quantities and estimate delivery before checkout." },
      { property: "og:title", content: "Your Bag — SAF SWIM BY SUMMER" },
      { property: "og:description", content: "Review your bag and continue to checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const hydrated = useCartHydrated();
  const { lines, remove, setQuantity } = useCart();
  const [country, setCountry] = useState(UK_COUNTRY_CODE);
  const methods = shippingMethodsFor(country);
  const subtotal = calculateSubtotal(lines);
  const shipping = methods[0] ? calculateShipping(methods[0].id, subtotal, country) : 0;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1500px] px-6 py-32 md:px-10">
        <div className="h-14 w-64 rounded-full skeleton-shimmer" />
        <div className="mt-10 h-40 rounded-[2rem] skeleton-shimmer" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <ShellMark className="h-20 w-20 text-gold animate-float" strokeWidth={1.4} />
        <h1 className="display-md mt-8">Your bag is empty</h1>
        <p className="mt-3 text-muted-foreground">A little piece of summer is waiting for you.</p>
        <Link to="/shop" className={buttonVariants({ className: "mt-10", size: "lg" })}>Explore collection</Link>
      </div>
    );
  }

  return (
    <>
      <PageHeading eyebrow="Shopping bag" title="Your Bag" />
      <div className="mx-auto grid max-w-[1500px] gap-12 px-6 pb-32 md:px-10 lg:grid-cols-[1.6fr_1fr]">
        <ul className="divide-y divide-border border-y border-border">
          <AnimatePresence initial={false}>
            {lines.map((l) => (
              <motion.li key={l.key} layout exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.5 }} className="flex gap-6 py-8">
                <Link to="/product/$slug" params={{ slug: l.slug }} className="block h-44 w-36 shrink-0 overflow-hidden rounded-[1.5rem] bg-muted">
                  <img src={l.image} alt={l.name} className="h-full w-full object-cover transition duration-1000 hover:scale-105" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                      <Link to="/product/$slug" params={{ slug: l.slug }} className="font-serif text-3xl leading-tight hover:text-gold">{l.name}</Link>
                      <p className="mt-1 text-sm text-muted-foreground">{[l.colour, l.size].filter(Boolean).join(" · ")}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{formatPrice(l.unitPricePence)} each</p>
                    </div>
                    <p className="font-serif text-2xl">{formatPrice(l.unitPricePence * l.quantity)}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-4 pt-6">
                    <QuantityStepper value={l.quantity} max={Math.min(10, l.maxQuantity)} onChange={(q) => setQuantity(l.key, q)} />
                    <button onClick={() => remove(l.key)} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:bg-secondary hover:text-destructive">
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <OrderSummary lines={lines} subtotalPence={subtotal} shippingPence={shipping} shippingLabel={methods[0]?.label}>
            <div className="mt-6">
              <label className="eyebrow text-muted-foreground" htmlFor="estimate-country">Estimate delivery to</label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="estimate-country" className="mt-2 h-12 rounded-full bg-background px-5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Link to="/checkout" className={buttonVariants({ size: "lg", className: "mt-6 w-full" })}>
              Continue to checkout <ArrowRight />
            </Link>
            <Link to="/shop" className="link-luxe eyebrow mx-auto mt-5 block w-fit text-muted-foreground">Continue shopping</Link>
          </OrderSummary>
        </div>
      </div>
    </>
  );
}
