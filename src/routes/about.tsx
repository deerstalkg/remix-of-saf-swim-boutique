import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FOUNDER, SITE } from "@/lib/site-config";
import { ImageReveal, Reveal } from "@/components/site/Reveal";
import { FloatingShells, OceanWaves } from "@/components/site/FloatingShells";
import { ShellMark } from "@/components/site/ShellLogo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — SAF SWIM BY SUMMER" },
      { name: "description", content: "The story behind SAF SWIM BY SUMMER — a coastal luxury label inspired by the ocean, sunlight and effortless elegance." },
      { property: "og:title", content: "Our Story — SAF SWIM BY SUMMER" },
      { property: "og:description", content: "A label inspired by Summer, ocean vibes and effortless fashion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const VALUES = [
  { title: "Ocean", text: "Every palette begins at the water — blues, sands and the pale gold of late light." },
  { title: "Elegance", text: "Clean lines and considered details, designed to feel quietly luxurious." },
  { title: "Ease", text: "Pieces that move with you, from the first swim to the last sunset." },
];

function About() {
  return (
    <>
      <section className="relative h-[90svh] min-h-[560px] overflow-hidden bg-ocean-night text-ivory">
        <img src="/images/shoreline-wide.jpg" alt="Turquoise sea meeting a sandy shore scattered with shells" className="absolute inset-0 h-full w-full object-cover animate-ken-burns" width={1920} height={1088} />
        <div className="absolute inset-0 bg-overlay" />
        <FloatingShells tone="ivory" />
        <div className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-end px-6 pb-32 md:px-10">
          <Reveal>
            <p className="eyebrow text-sand">Our Story</p>
            <h1 className="display-xl mt-4 max-w-4xl">Made from <em className="text-sand">salt, sun</em> and a feeling.</h1>
          </Reveal>
        </div>
        <OceanWaves />
      </section>

      <section className="mx-auto grid max-w-[1500px] items-center gap-16 px-6 py-28 md:px-10 md:py-40 lg:grid-cols-2">
        <ImageReveal src="/images/atelier.jpg" alt="Design sketches and fabric swatches by an open window to the sea" width={1024} height={1344} className="aspect-[4/5] rounded-[2.5rem]" />
        <Reveal>
          <p className="eyebrow text-gold">{FOUNDER.role}</p>
          <h2 className="display-lg mt-4">Meet {FOUNDER.name}</h2>
          <p className="mt-8 text-lg leading-relaxed">{FOUNDER.intro}</p>
          {FOUNDER.paragraphs.map((p) => (
            <p key={p} className="mt-5 leading-relaxed text-muted-foreground">{p}</p>
          ))}
        </Reveal>
      </section>

      <section className="relative overflow-hidden bg-sand-fade py-28 md:py-36">
        <FloatingShells />
        <div className="relative mx-auto max-w-[1500px] px-6 md:px-10">
          <Reveal className="text-center">
            <p className="eyebrow text-gold">What we believe</p>
            <h2 className="display-lg mt-4">The house codes</h2>
          </Reveal>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.12} className="rounded-[2rem] border border-border bg-card p-10 text-center shadow-soft">
                <ShellMark className="mx-auto h-12 w-12 text-gold" strokeWidth={1.6} />
                <h3 className="mt-6 font-serif text-4xl">{v.title}</h3>
                <p className="mt-4 text-muted-foreground">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary text-primary-foreground grain">
        <div className="relative z-10 grid lg:grid-cols-2">
          <div className="flex items-center px-6 py-24 md:px-16 lg:px-24">
            <Reveal>
              <blockquote className="font-serif text-4xl font-light italic leading-snug text-sand md:text-5xl">"{FOUNDER.quote}"</blockquote>
              <p className="eyebrow mt-6 text-ivory/60">— {FOUNDER.name}</p>
              <div className="mt-12 flex flex-wrap gap-3">
                <Link to="/shop" className={buttonVariants({ variant: "hero" })}>Explore collection <ArrowRight /></Link>
                <a href={SITE.instagram.url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "heroOutline" })}>{SITE.instagram.handle}</a>
              </div>
            </Reveal>
          </div>
          <div className="relative min-h-[520px]">
            <ImageReveal src="/images/collection-golden-hour.jpg" alt="Champagne satin dress on a terrace at sunset" width={1024} height={1344} className="absolute inset-0" />
          </div>
        </div>
      </section>
    </>
  );
}
