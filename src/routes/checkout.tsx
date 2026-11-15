import type * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { z } from "zod";
import { Lock, CreditCard, CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCart, useCartHydrated } from "@/lib/cart-store";
import { createOrder } from "@/lib/orders.functions";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site-config";
import { calculateShipping, calculateSubtotal, COUNTRIES, shippingMethodsFor, UK_COUNTRY_CODE, type ShippingMethodId } from "@/lib/shipping";
import { OrderSummary } from "@/components/site/OrderSummary";
import { PageHeading } from "@/components/site/PageHeading";
import { ShellMark } from "@/components/site/ShellLogo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — SAF SWIM BY SUMMER" },
      { name: "description", content: "Enter your contact and delivery details to complete your SAF SWIM order." },
      { property: "og:title", content: "Checkout — SAF SWIM BY SUMMER" },
      { property: "og:description", content: "Secure checkout for SAF SWIM BY SUMMER." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const formSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(320),
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z.string().trim().max(40).optional(),
  address1: z.string().trim().min(3, "Enter your address").max(200),
  address2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2, "Enter your town or city").max(100),
  postcode: z.string().trim().min(2, "Enter your postcode").max(20),
  country: z.string().length(2),
  notes: z.string().trim().max(500).optional(),
});
type FormValues = z.infer<typeof formSchema>;
type Errors = Partial<Record<keyof FormValues, string>>;

function CheckoutPage() {
  const hydrated = useCartHydrated();
  const { lines, clear } = useCart();
  const submitOrder = useServerFn(createOrder);
  const [values, setValues] = useState<FormValues>({
    email: "", fullName: "", phone: "", address1: "", address2: "", city: "", postcode: "", country: UK_COUNTRY_CODE, notes: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const methods = shippingMethodsFor(values.country);
  const [method, setMethod] = useState<ShippingMethodId>(methods[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ orderNumber: string; totalPence: number } | null>(null);

  useEffect(() => {
    if (!methods.some((m) => m.id === method)) setMethod(methods[0].id);
  }, [values.country]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      if (email) setValues((v) => (v.email ? v : { ...v, email }));
    });
  }, []);

  const subtotal = calculateSubtotal(lines);
  const shipping = useMemo(() => calculateShipping(method, subtotal, values.country), [method, subtotal, values.country]);
  const set = (k: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as keyof FormValues] ??= issue.message;
      setErrors(errs);
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setErrors({});
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await submitOrder({
        data: {
          ...parsed.data,
          shippingMethod: method,
          items: lines.map((l) => ({ productId: l.productId, size: l.size, colour: l.colour, quantity: l.quantity })),
        },
      });
      if (!res.ok) {
        setServerError(res.error);
        return;
      }
      // Payment provider hand-off goes here once connected (SITE.paymentsEnabled).
      setPlaced({ orderNumber: res.orderNumber, totalPence: res.totalPence });
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError("We couldn't reach our servers. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}>
          <ShellMark className="h-20 w-20 text-gold" strokeWidth={1.4} />
        </motion.div>
        <p className="eyebrow mt-8 text-gold">Order reserved</p>
        <h1 className="display-md mt-3">Thank you, your order is saved</h1>
        <p className="mt-6 text-muted-foreground">
          Order <span className="font-semibold text-primary">{placed.orderNumber}</span> · {formatPrice(placed.totalPence)}
        </p>
        <div className="mt-8 rounded-[1.5rem] border border-gold/40 bg-card p-6 text-left text-sm text-muted-foreground">
          <p className="font-semibold text-primary">Status: awaiting payment</p>
          <p className="mt-2">
            Online payment isn't switched on yet, so <strong>no payment has been taken</strong>. We'll be in touch at your email address to complete your order.
          </p>
        </div>
        <Link to="/shop" className={buttonVariants({ className: "mt-10" })}>Continue shopping</Link>
      </div>
    );
  }

  if (!hydrated) {
    return <div className="mx-auto max-w-[1500px] px-6 py-32 md:px-10"><div className="h-96 rounded-[2rem] skeleton-shimmer" /></div>;
  }

  if (lines.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <ShellMark className="h-20 w-20 text-gold" strokeWidth={1.4} />
        <h1 className="display-md mt-8">Your bag is empty</h1>
        <Link to="/shop" className={buttonVariants({ className: "mt-10" })}>Explore collection</Link>
      </div>
    );
  }

  const field = (k: keyof FormValues, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className={props.className}>
      <Label htmlFor={`f-${k}`} className="eyebrow text-muted-foreground">{label}</Label>
      <Input
        id={`f-${k}`}
        value={values[k] ?? ""}
        onChange={set(k)}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `e-${k}` : undefined}
        {...props}
        className="mt-2 h-13 rounded-full border-input bg-card px-5"
      />
      {errors[k] && <p id={`e-${k}`} className="mt-1.5 pl-5 text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <>
      <PageHeading eyebrow="Secure checkout" title="Checkout" />
      <form onSubmit={submit} noValidate className="mx-auto grid max-w-[1500px] gap-12 px-6 pb-32 md:px-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-14">
          <Step n={1} title="Contact">
            <div className="grid gap-5 sm:grid-cols-2">
              {field("email", "Email", { type: "email", autoComplete: "email", className: "sm:col-span-2" })}
              {field("fullName", "Full name", { autoComplete: "name" })}
              {field("phone", "Phone (optional)", { type: "tel", autoComplete: "tel" })}
            </div>
          </Step>
          <Step n={2} title="Delivery">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="f-country" className="eyebrow text-muted-foreground">Country</Label>
                <Select value={values.country} onValueChange={(c) => setValues((v) => ({ ...v, country: c }))}>
                  <SelectTrigger id="f-country" className="mt-2 h-13 rounded-full bg-card px-5"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {field("address1", "Address", { autoComplete: "address-line1", className: "sm:col-span-2" })}
              {field("address2", "Apartment, suite (optional)", { autoComplete: "address-line2", className: "sm:col-span-2" })}
              {field("city", "Town / City", { autoComplete: "address-level2" })}
              {field("postcode", "Postcode", { autoComplete: "postal-code" })}
            </div>
            <fieldset className="mt-8">
              <legend className="eyebrow text-muted-foreground">Delivery method</legend>
              <div className="mt-3 grid gap-3">
                {methods.map((m) => {
                  const price = calculateShipping(m.id, subtotal, values.country);
                  return (
                    <label key={m.id} className={cn("flex cursor-pointer items-center justify-between rounded-full border px-6 py-4 transition", method === m.id ? "border-primary bg-card shadow-soft" : "border-border hover:border-primary/50")}>
                      <span className="flex items-center gap-4">
                        <input type="radio" name="shipping" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="h-4 w-4 accent-[var(--ocean-deep)]" />
                        <span>
                          <span className="block font-medium">{m.label}</span>
                          <span className="block text-xs text-muted-foreground">{m.eta}</span>
                        </span>
                      </span>
                      <span className="text-sm font-medium">{price === 0 ? "Complimentary" : formatPrice(price)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="mt-6">
              <Label htmlFor="f-notes" className="eyebrow text-muted-foreground">Order notes (optional)</Label>
              <Textarea id="f-notes" value={values.notes} onChange={set("notes")} maxLength={500} className="mt-2 rounded-3xl bg-card px-5 py-4" rows={3} />
            </div>
          </Step>
          <Step n={3} title="Payment">
            <div className="rounded-[1.75rem] border border-dashed border-gold/60 bg-card p-7">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-gold" />
                <p className="font-serif text-2xl">Secure online payment</p>
              </div>
              {SITE.paymentsEnabled ? null : (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Card payments aren't switched on yet. Placing your order will save it as <strong className="text-primary">awaiting payment</strong> — no money is taken, and we'll contact you to complete it.
                </p>
              )}
              <ul className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay"].map((m) => (
                  <li key={m} className="rounded-full border border-border px-3 py-1">{m}</li>
                ))}
                <li className="rounded-full px-1 py-1 italic">— available once payments launch</li>
              </ul>
            </div>
          </Step>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <OrderSummary lines={lines} subtotalPence={subtotal} shippingPence={shipping} shippingLabel={methods.find((m) => m.id === method)?.label}>
            {serverError && <p role="alert" className="mt-6 rounded-2xl bg-destructive/10 px-5 py-3 text-sm text-destructive">{serverError}</p>}
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
              {submitting ? "Saving your order…" : <><Lock /> Place order — pay later</>}
            </Button>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-gold" /> Prices and stock are confirmed when you place your order
            </p>
          </OrderSummary>
        </div>
      </form>
    </>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`}>
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold font-serif text-xl text-gold">{n}</span>
        <h2 id={`step-${n}`} className="font-serif text-3xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
