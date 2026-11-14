import { Link } from "@tanstack/react-router";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cartCount, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { amountToFreeShipping, calculateSubtotal, FREE_UK_SHIPPING_THRESHOLD_PENCE } from "@/lib/shipping";
import { QuantityStepper } from "./QuantityStepper";
import { ShellMark } from "./ShellLogo";

export function CartDrawer() {
  const { lines, isOpen, setOpen, remove, setQuantity } = useCart();
  const subtotal = calculateSubtotal(lines);
  const toFree = amountToFreeShipping(subtotal);
  const progress = Math.min(100, (subtotal / FREE_UK_SHIPPING_THRESHOLD_PENCE) * 100);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-lift duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
          <div className="flex items-center justify-between border-b border-border px-7 py-6">
            <DialogPrimitive.Title className="font-serif text-3xl">
              Your Bag <span className="ml-1 align-top font-sans text-sm text-muted-foreground">({cartCount(lines)})</span>
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Items in your shopping bag</DialogPrimitive.Description>
            <DialogPrimitive.Close className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-secondary" aria-label="Close bag">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
              <ShellMark className="h-16 w-16 text-gold animate-float" strokeWidth={1.5} />
              <p className="mt-6 font-serif text-3xl">Your bag is waiting</p>
              <p className="mt-2 text-sm text-muted-foreground">Discover pieces made for long summer days.</p>
              <Link to="/shop" onClick={() => setOpen(false)} className={buttonVariants({ className: "mt-8" })}>
                Explore collection
              </Link>
            </div>
          ) : (
            <>
              <div className="border-b border-border px-7 py-4">
                <p className="text-xs text-muted-foreground">
                  {toFree > 0 ? (
                    <>
                      You're <span className="font-semibold text-primary">{formatPrice(toFree)}</span> away from free UK delivery
                    </>
                  ) : (
                    <span className="text-gold">You've unlocked free UK standard delivery</span>
                  )}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                  <motion.div className="h-full rounded-full bg-gold" initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
                </div>
              </div>
              <ul className="flex-1 space-y-6 overflow-y-auto px-7 py-6">
                <AnimatePresence initial={false}>
                  {lines.map((line) => (
                    <motion.li
                      key={line.key}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30, height: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex gap-4"
                    >
                      <Link to="/product/$slug" params={{ slug: line.slug }} onClick={() => setOpen(false)} className="block h-28 w-22 shrink-0 overflow-hidden rounded-2xl bg-muted">
                        <img src={line.image} alt={line.name} className="h-full w-full object-cover" loading="lazy" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-3">
                          <p className="font-serif text-xl leading-tight">{line.name}</p>
                          <p className="text-sm font-medium">{formatPrice(line.unitPricePence * line.quantity)}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[line.colour, line.size].filter(Boolean).join(" · ")}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <QuantityStepper size="sm" value={line.quantity} max={Math.min(10, line.maxQuantity)} onChange={(q) => setQuantity(line.key, q)} />
                          <button onClick={() => remove(line.key)} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-destructive" aria-label={`Remove ${line.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <div className="space-y-4 border-t border-border bg-card px-7 py-6">
                <div className="flex justify-between">
                  <span className="eyebrow text-muted-foreground">Subtotal</span>
                  <span className="font-serif text-2xl">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Delivery calculated at checkout.</p>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/cart" onClick={() => setOpen(false)} className={buttonVariants({ variant: "outline" })}>
                    View bag
                  </Link>
                  <Link to="/checkout" onClick={() => setOpen(false)} className={buttonVariants()}>
                    Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
