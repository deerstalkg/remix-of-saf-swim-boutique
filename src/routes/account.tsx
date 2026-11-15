import type * as React from "react";
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getMyOrders } from "@/lib/orders.functions";
import { formatPrice } from "@/lib/format";
import { PageHeading } from "@/components/site/PageHeading";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — SAF SWIM BY SUMMER" },
      { name: "description", content: "Sign in to view your SAF SWIM orders." },
      { property: "og:title", content: "My Account — SAF SWIM BY SUMMER" },
      { property: "og:description", content: "Sign in to your SAF SWIM account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

function Account() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  if (user === undefined) return <div className="mx-auto max-w-xl px-6 py-40"><div className="h-64 rounded-[2rem] skeleton-shimmer" /></div>;
  return user ? <Orders user={user} /> : <AuthForm />;
}

function AuthForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    const res = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/account` } });
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    if (mode === "up" && !res.data.session) toast.success("Check your email to confirm your account");
  };
  return (
    <>
      <PageHeading eyebrow="Account" title={mode === "in" ? "Welcome back" : "Join the circle"} className="text-center" />
      <form onSubmit={submit} className="mx-auto mb-32 max-w-md space-y-5 rounded-[2.5rem] border border-border bg-card p-8 shadow-soft md:p-10">
        <div>
          <Label htmlFor="a-email" className="eyebrow text-muted-foreground">Email</Label>
          <Input id="a-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-13 rounded-full bg-background px-5" />
        </div>
        <div>
          <Label htmlFor="a-pass" className="eyebrow text-muted-foreground">Password</Label>
          <Input id="a-pass" type="password" required autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-13 rounded-full bg-background px-5" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</Button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="link-luxe eyebrow mx-auto block text-muted-foreground">
          {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
      </form>
    </>
  );
}

function Orders({ user }: { user: User }) {
  const fetchOrders = useServerFn(getMyOrders);
  const { data, isLoading, isError } = useQuery({ queryKey: ["my-orders", user.id], queryFn: () => fetchOrders() });
  return (
    <>
      <PageHeading eyebrow="My account" title="Your orders">{user.email}</PageHeading>
      <div className="mx-auto max-w-4xl space-y-5 px-6 pb-32 md:px-10">
        {isLoading && <div className="h-32 rounded-[2rem] skeleton-shimmer" />}
        {isError && <p className="text-destructive">Your orders couldn't be loaded.</p>}
        {data?.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-serif text-3xl">No orders yet</p>
            <Link to="/shop" className={buttonVariants({ className: "mt-6" })}>Explore collection</Link>
          </div>
        )}
        {data?.map((o) => (
          <div key={o.id} className="rounded-[2rem] border border-border bg-card p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-serif text-2xl">{o.order_number}</p>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs uppercase tracking-[0.2em]">{o.status.replace("_", " ")}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-GB")} · {formatPrice(o.total_pence, o.currency)}</p>
            <ul className="mt-4 text-sm text-muted-foreground">
              {o.order_items.map((it, i) => <li key={i}>{it.quantity} × {it.product_name} {[it.colour, it.size].filter(Boolean).join(" · ")}</li>)}
            </ul>
          </div>
        ))}
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>
    </>
  );
}
