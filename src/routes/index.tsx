import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { collectionsQuery, productsQuery } from "@/lib/catalog.queries";
import { FOUNDER, SITE } from "@/lib/site-config";
import { ProductCard } from "@/components/site/ProductCard";
import { ImageReveal, Reveal, Stagger, staggerItem } from "@/components/site/Reveal";
import { FloatingShells, OceanWaves } from "@/components/site/FloatingShells";
import { Newsletter } from "@/components/site/Newsletter";
import { ShellMark } from "@/components/site/ShellLogo";
import { InstagramIcon } from "@/components/site/SocialIcons";
import { SampleBadge } from "@/components/site/SampleBadge";
import type { Collection } from "@/lib/catalog-types";

const bestsellersQuery = productsQuery({ bestsellers: true, limit: 4 });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SAF SWIM BY SUMMER — A Little Piece of Summer, Wherever You Go" },
      { name: "description", content: "Coastal luxury swimwear, resort dresses and summer accessories inspired by the ocean. Discover the SAF SWIM collections by Summer." },
      { property: "og:title", content: "SAF SWIM BY SUMMER — A Little Piece of Summer" },
      { property: "og:description", content: "Coastal luxury swimwear and resort wear inspired by oceans, beaches and effortless elegance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(collectionsQuery()),
      context.queryClient.ensureQueryData(bestsellersQuery),
    ]),
  component: Home,
});

const EASE = [0.22, 1, 0.36, 1] as const;

function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <FeaturedCollections />
      <SummerEdit />
      <Bestsellers />
      <BrandStory />
      <InstagramGallery />
      <Newsletter />
    </>
  );
}

function Hero() {
  const words = SITE.tagline.split(" ");
  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ocean-night text-ivory">
      <img
        src="/images/hero.jpg"
        alt="A woman in an ivory linen cover-up walking along a sunlit beach"
        width={1920}
        height={1088}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[70%_center] animate-ken-burns"
      />
      <div className="absolute inset-0 bg-hero-fade" />
      <div className="absolute inset-0 bg-side-fade" />
      <FloatingShells tone="ivory" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1500px] flex-col justify-end px-6 pb-32 md:px-10 md:pb-40">
        <motion.p
          className="eyebrow text-sand"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3, ease: EASE }}
        >
          SAF SWIM by Summer — The Summer Collection
        </motion.p>
        <h1 className="display-xl mt-6 max-w-5xl">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-2 align-bottom">
              <motion.span
                className={`inline-block ${w.startsWith("Summer") ? "italic text-sand" : ""}`}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 1.4 + i * 0.08, ease: EASE }}
              >
                {w}&nbsp;
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 2.2, ease: EASE }}
          className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-md text-base leading-relaxed text-ivory/85 md:text-lg">
            Swimwear and resort pieces shaped by salt air, soft sand and golden light — designed to carry the feeling of summer with you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/shop" className={buttonVariants({ variant: "hero", size: "lg" })}>
              Explore Collection <ArrowRight />
            </Link>
            <Link to="/about" className={buttonVariants({ variant: "heroOutline", size: "lg" })}>
              Our Story
            </Link>
          </div>
        </motion.div>
      </div>

      <a href="#statement" className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory/70 transition hover:text-ivory md:flex" aria-label="Scroll to discover">
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
      <OceanWaves />
    </section>
  );
}

function Statement() {
  return (
    <section id="statement" className="relative bg-background py-28 md:py-40">
      <FloatingShells />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <ShellMark className="mx-auto h-12 w-12 text-gold" strokeWidth={1.6} />
          <p className="mt-10 font-serif text-3xl font-light leading-snug md:text-5xl md:leading-tight">
            Born by the water, made for the <em className="text-ocean">slow, sunlit hours</em> — pieces that feel like the first day of summer, every time you wear them.
          </p>
          <p className="eyebrow mt-10 text-muted-foreground">Est. by Summer</p>
        </Reveal>
      </div>
    </section>
  );
}

function CollectionTile({ c, className, tall = false }: { c: Collection; className?: string; tall?: boolean }) {
  return (
    <Link to="/collections/$slug" params={{ slug: c.slug }} className={`group relative block overflow-hidden rounded-[2rem] bg-muted ${className ?? ""}`}>
      <img src={c.imageUrl} alt={c.name} loading="lazy" width={1024} height={1344} className={`zoom-img h-full w-full object-cover ${tall ? "min-h-[560px]" : "min-h-[340px]"}`} />
      <div className="absolute inset-0 bg-card-fade" />
      {c.isSample && <SampleBadge className="absolute left-6 top-6" />}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-8 text-ivory md:p-10">
        <p className="eyebrow text-sand">{c.tagline}</p>
        <h3 className={`mt-3 font-serif font-light leading-none ${tall ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl"}`}>{c.name}</h3>
        <span className={`${buttonVariants({ variant: "hero", size: "sm" })} mt-6 translate-y-2 opacity-90 transition duration-700 group-hover:translate-y-0 group-hover:opacity-100`}>
          Shop now <ArrowRight />
        </span>
      </div>
    </Link>
  );
}

function FeaturedCollections() {
  const { data: collections } = useSuspenseQuery(collectionsQuery());
  const [first, second, third] = collections;
  return (
    <section className="mx-auto max-w-[1500px] px-6 pb-28 md:px-10 md:pb-40" aria-labelledby="collections-title">
      <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <Reveal>
          <p className="eyebrow text-gold">Featured Collections</p>
          <h2 id="collections-title" className="display-lg mt-4 max-w-2xl">Stories told in <em>sea and sun</em></h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Link to="/collections" className="link-luxe eyebrow inline-flex items-center gap-2">
            All collections <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {first && (
          <Reveal className="h-full">
            <CollectionTile c={first} tall className="h-full" />
          </Reveal>
        )}
        <div className="grid gap-6">
          {second && (
            <Reveal delay={0.1}>
              <CollectionTile c={second} className="aspect-[16/11] lg:aspect-auto lg:h-[380px]" />
            </Reveal>
          )}
          {third && (
            <Reveal delay={0.2}>
              <CollectionTile c={third} className="aspect-[16/11] lg:aspect-auto lg:h-[380px]" />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

function SummerEdit() {
  return (
    <section className="relative overflow-hidden bg-sand-fade py-28 md:py-40" aria-labelledby="edit-title">
      <div className="mx-auto grid max-w-[1500px] items-center gap-16 px-6 md:px-10 lg:grid-cols-12">
        <div className="relative lg:col-span-6">
          <ImageReveal src="/images/summer-edit.jpg" alt="A woman in an ivory linen dress holding a seashell on a seaside balcony" width={1024} height={1344} className="aspect-[4/5] rounded-[2.5rem] lg:mr-16" />
          <div className="absolute -bottom-10 right-0 hidden w-56 overflow-hidden rounded-[1.75rem] border-8 border-background shadow-lift md:block lg:w-64">
            <ImageReveal src="/images/product-earrings-1.jpg" alt="Gold shell earrings with pearls resting on sand" width={1024} height={1280} className="aspect-[4/5]" delay={0.3} />
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <Reveal>
            <p className="eyebrow text-gold">The Summer Edit</p>
            <h2 id="edit-title" className="display-lg mt-5">
              Effortless, <em>sun-warmed</em> elegance.
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
              Our edit begins at the water's edge — with fluid silhouettes, natural textures and a palette drawn from the shoreline: ocean blue, sand, ivory and the soft gold of late afternoon.
            </p>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Layer a sheer sarong over sculpted swim, slip into linen for lunch by the harbour, and finish with a single shell at the ear.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 border-y border-border py-8">
              {[
                ["Swim", "Sculpted"],
                ["Linen", "Breathable"],
                ["Gold", "Timeless"],
              ].map(([a, b]) => (
                <div key={a}>
                  <p className="font-serif text-3xl">{a}</p>
                  <p className="eyebrow mt-1 text-muted-foreground">{b}</p>
                </div>
              ))}
            </div>
            <Link to="/shop" className={buttonVariants({ className: "mt-10" })}>
              Shop the edit <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Bestsellers() {
  const { data: products } = useSuspenseQuery(bestsellersQuery);
  return (
    <section className="mx-auto max-w-[1500px] px-6 py-28 md:px-10 md:py-40" aria-labelledby="best-title">
      <div className="mb-14 flex flex-col items-center text-center">
        <Reveal>
          <p className="eyebrow text-gold">Bestsellers</p>
          <h2 id="best-title" className="display-lg mt-4">Most loved pieces</h2>
          <p className="mx-auto mt-5 max-w-md text-muted-foreground">The pieces our circle reaches for first — shown here as samples while the full catalogue is prepared.</p>
        </Reveal>
      </div>
      <Stagger className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <motion.div key={p.id} variants={staggerItem}>
            <ProductCard product={p} />
          </motion.div>
        ))}
      </Stagger>
      <div className="mt-16 text-center">
        <Link to="/shop" className={buttonVariants({ variant: "outline", size: "lg" })}>
          View all pieces
        </Link>
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground grain" aria-labelledby="story-title">
      <div className="relative z-10 grid lg:grid-cols-2">
        <div className="relative min-h-[520px] lg:min-h-[820px]">
          <ImageReveal src="/images/founder-mood.jpg" alt="A woman with a straw hat watching the sunset over the sea" width={1024} height={1344} className="absolute inset-0" />
        </div>
        <div className="flex items-center px-6 py-24 md:px-16 lg:px-24">
          <Reveal className="max-w-xl">
            <p className="eyebrow text-gold">Brand Story</p>
            <h2 id="story-title" className="display-lg mt-5">
              Meet <em className="text-sand">{FOUNDER.name}</em>
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-ivory/80">{FOUNDER.intro}</p>
            <blockquote className="mt-10 border-l border-gold pl-6 font-serif text-3xl font-light italic leading-snug text-sand">
              "{FOUNDER.quote}"
              <footer className="eyebrow mt-4 not-italic text-ivory/60">— {FOUNDER.name}, {FOUNDER.role}</footer>
            </blockquote>
            <Link to="/about" className={buttonVariants({ variant: "hero", className: "mt-12" })}>
              Read our story <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const GALLERY = [
  { src: "/images/product-shoreline-2.jpg", alt: "Walking out of the sea in an ocean-blue swimsuit", className: "row-span-2" },
  { src: "/images/product-tote-2.jpg", alt: "Straw tote, sunglasses and a shell on the sand", className: "" },
  { src: "/images/collection-golden-hour.jpg", alt: "Champagne satin dress at sunset", className: "row-span-2" },
  { src: "/images/product-earrings-2.jpg", alt: "Gold shell earring in golden light", className: "" },
  { src: "/images/product-sarong-2.jpg", alt: "Sheer sarong over turquoise water", className: "row-span-2" },
  { src: "/images/atelier.jpg", alt: "Design sketches and fabric swatches by the sea", className: "" },
];

function InstagramGallery() {
  return (
    <section className="mx-auto max-w-[1500px] px-6 py-28 md:px-10 md:py-40" aria-labelledby="insta-title">
      <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <Reveal>
          <p className="eyebrow text-gold">Instagram Inspiration</p>
          <h2 id="insta-title" className="display-lg mt-4">
            Join us <em>{SITE.instagram.handle}</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <a href={SITE.instagram.url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline" })}>
            <InstagramIcon className="h-4 w-4" /> Follow on Instagram
          </a>
        </Reveal>
      </div>
      <Stagger className="grid auto-rows-[160px] grid-cols-2 gap-4 md:auto-rows-[200px] md:grid-cols-3 lg:grid-cols-6">
        {GALLERY.map((g) => (
          <motion.a
            key={g.src}
            variants={staggerItem}
            href={SITE.instagram.url}
            target="_blank"
            rel="noreferrer"
            className={`group relative overflow-hidden rounded-[1.5rem] bg-muted ${g.className}`}
            aria-label={`${g.alt} — view on Instagram`}
          >
            <img src={g.src} alt={g.alt} loading="lazy" className="zoom-img absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-overlay opacity-0 transition duration-500 group-hover:opacity-100">
              <InstagramIcon className="h-7 w-7 text-ivory" />
            </span>
          </motion.a>
        ))}
      </Stagger>
    </section>
  );
}
