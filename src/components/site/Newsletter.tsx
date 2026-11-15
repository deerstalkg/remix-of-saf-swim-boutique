import type * as React from "react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "./Reveal";
import { FloatingShells } from "./FloatingShells";

const emailSchema = z.string().trim().email("Please enter a valid email address").max(320);

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setError(null);
    setState("loading");
    const { error: err } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data.toLowerCase() });
    if (err && err.code !== "23505") {
      setState("idle");
      setError("Something went wrong. Please try again.");
      return;
    }
    setState("done");
    toast.success(err ? "You're already in the Summer Circle" : "Welcome to the Summer Circle");
  };

  return (
    <section className="relative overflow-hidden" aria-labelledby="newsletter-title">
      <img src="/images/shoreline-wide.jpg" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1088} />
      <div className="absolute inset-0 bg-overlay" />
      <FloatingShells tone="ivory" />
      <div className="relative mx-auto max-w-3xl px-6 py-32 text-center text-ivory md:py-44">
        <Reveal>
          <p className="eyebrow text-sand">The Newsletter</p>
          <h2 id="newsletter-title" className="display-lg mt-5">Stay in the Summer Circle.</h2>
          <p className="mx-auto mt-6 max-w-xl text-ivory/85">
            Be first to discover new collections, private previews and stories from the shoreline.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          {state === "done" ? (
            <p className="mt-12 font-serif text-3xl italic text-sand">Thank you — see you by the sea.</p>
          ) : (
            <form onSubmit={submit} className="mx-auto mt-12 flex max-w-lg flex-col gap-3 sm:flex-row" noValidate>
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                autoComplete="email"
                aria-invalid={!!error}
                aria-describedby={error ? "newsletter-error" : undefined}
                className="h-14 flex-1 rounded-full border border-ivory/40 bg-ivory/10 px-7 text-ivory backdrop-blur placeholder:text-ivory/60 focus:border-ivory focus:outline-none"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ivory px-8 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-ocean-deep transition duration-500 hover:bg-gold hover:text-pearl disabled:opacity-60"
              >
                {state === "loading" ? "Joining…" : "Subscribe"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
          {error && <p id="newsletter-error" role="alert" className="mt-4 text-sm text-sand">{error}</p>}
        </Reveal>
      </div>
    </section>
  );
}
