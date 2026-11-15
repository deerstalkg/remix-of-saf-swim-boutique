import type * as React from "react";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { DELIVERY_COPY, SITE } from "@/lib/site-config";
import { PageHeading } from "@/components/site/PageHeading";
import { Reveal } from "@/components/site/Reveal";
import { InstagramIcon, TikTokIcon } from "@/components/site/SocialIcons";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SAF SWIM BY SUMMER" },
      { name: "description", content: "Get in touch with SAF SWIM BY SUMMER — send a message, or find us on Instagram and TikTok." },
      { property: "og:title", content: "Contact — SAF SWIM BY SUMMER" },
      { property: "og:description", content: "Send us a message or follow along on Instagram and TikTok." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(320),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Write a message").max(5000),
});

function Contact() {
  const [v, setV] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(v);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] ??= i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setState("sending");
    const { error } = await supabase.from("contact_messages").insert({ ...parsed.data, subject: parsed.data.subject || null });
    if (error) {
      setState("idle");
      toast.error("Your message couldn't be sent. Please try again.");
      return;
    }
    setState("sent");
  };

  const f = (k: keyof typeof v, label: string, type = "text") => (
    <div>
      <Label htmlFor={`c-${k}`} className="eyebrow text-muted-foreground">{label}</Label>
      <Input id={`c-${k}`} type={type} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} aria-invalid={!!errors[k]} className="mt-2 h-13 rounded-full bg-card px-5" />
      {errors[k] && <p className="mt-1.5 pl-5 text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <>
      <PageHeading eyebrow="Contact" title={<>Let's <em>talk</em></>}>
        Questions about a piece, sizing or an order? We'd love to hear from you.
      </PageHeading>
      <div className="mx-auto grid max-w-[1500px] gap-12 px-6 pb-24 md:px-10 lg:grid-cols-[1fr_1.3fr]">
        <Reveal className="space-y-6">
          <a href={`mailto:${SITE.email}`} className="flex items-center gap-5 rounded-[2rem] border border-border bg-card p-7 transition hover:border-gold">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-gold"><Mail className="h-5 w-5" /></span>
            <span><span className="eyebrow block text-muted-foreground">Email</span><span className="font-serif text-2xl">{SITE.email}</span></span>
          </a>
          <a href={SITE.instagram.url} target="_blank" rel="noreferrer" className="flex items-center gap-5 rounded-[2rem] border border-border bg-card p-7 transition hover:border-gold">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-gold"><InstagramIcon /></span>
            <span><span className="eyebrow block text-muted-foreground">Instagram</span><span className="font-serif text-2xl">{SITE.instagram.handle}</span></span>
          </a>
          <a href={SITE.tiktok.url} target="_blank" rel="noreferrer" className="flex items-center gap-5 rounded-[2rem] border border-border bg-card p-7 transition hover:border-gold">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-gold"><TikTokIcon /></span>
            <span><span className="eyebrow block text-muted-foreground">TikTok</span><span className="font-serif text-2xl">{SITE.tiktok.handle}</span></span>
          </a>
        </Reveal>
        <Reveal delay={0.1} className="rounded-[2.5rem] border border-border bg-card p-8 shadow-soft md:p-12">
          {state === "sent" ? (
            <div className="py-16 text-center">
              <p className="font-serif text-4xl">Thank you</p>
              <p className="mt-3 text-muted-foreground">Your message has been received. We'll reply soon.</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
              {f("name", "Name")}
              {f("email", "Email", "email")}
              <div className="sm:col-span-2">{f("subject", "Subject (optional)")}</div>
              <div className="sm:col-span-2">
                <Label htmlFor="c-message" className="eyebrow text-muted-foreground">Message</Label>
                <Textarea id="c-message" rows={6} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} aria-invalid={!!errors.message} className="mt-2 rounded-3xl bg-background px-5 py-4" />
                {errors.message && <p className="mt-1.5 pl-5 text-xs text-destructive">{errors.message}</p>}
              </div>
              <Button type="submit" size="lg" className="sm:col-span-2" disabled={state === "sending"}>
                <Send /> {state === "sending" ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </Reveal>
      </div>
      <section id="delivery" className="mx-auto max-w-4xl scroll-mt-32 px-6 pb-32 md:px-10">
        <h2 className="display-md">Delivery & returns</h2>
        <p className="mt-6 leading-relaxed text-muted-foreground">{DELIVERY_COPY.delivery}</p>
        <p className="mt-4 leading-relaxed text-muted-foreground">{DELIVERY_COPY.returns}</p>
      </section>
    </>
  );
}
