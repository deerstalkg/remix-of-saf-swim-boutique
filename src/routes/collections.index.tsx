import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { collectionsQuery } from "@/lib/catalog.queries";
import { ImageReveal, Reveal } from "@/components/site/Reveal";
import { SampleBadge } from "@/components/site/SampleBadge";
import { PageHeading } from "@/components/site/PageHeading";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — SAF SWIM BY SUMMER" },
      { name: "description", content: "Explore the SAF SWIM collections: The Shoreline Edit, Golden Hour and Riviera Linen — swim, resort and coastal pieces inspired by summer." },
      { property: "og:title", content: "Collections — SAF SWIM BY SUMMER" },
      { property: "og:description", content: "Swim, resort and coastal linen collections inspired by the sea." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(collectionsQuery()),
  component: Collections,
});

function Collections() {
  const { data: collections } = useSuspenseQuery(collectionsQuery());
  return (
    <>
      <PageHeading eyebrow="The Collections" title={<>Chapters of <em>summer</em></>}>
        Each collection begins with a place and a feeling — sunlit rocks, a terrace at dusk, dunes in the morning breeze.
      </PageHeading>
      <div className="mx-auto max-w-[1500px] space-y-28 px-6 pb-32 md:space-y-40 md:px-10">
        {collections.map((c, i) => (
          <article key={c.id} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className={`lg:col-span-7 ${i % 2 === 1 ? "lg:order-2 lg:col-start-6" : ""}`}>
              <Link to="/collections/$slug" params={{ slug: c.slug }} className="group block">
                <ImageReveal src={c.imageUrl} alt={c.name} width={1024} height={1344} className="aspect-[4/5] rounded-[2.5rem] md:aspect-[5/4]" imgClassName="zoom-img" />
              </Link>
            </div>
            <Reveal className={`lg:col-span-4 ${i % 2 === 1 ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"}`}>
              <p className="font-serif text-7xl font-light text-gold/50">0{i + 1}</p>
              {c.isSample && <SampleBadge className="mt-4" />}
              <p className="eyebrow mt-5 text-gold">{c.tagline}</p>
              <h2 className="display-md mt-3">{c.name}</h2>
              <p className="mt-6 leading-relaxed text-muted-foreground">{c.description}</p>
              <Link to="/collections/$slug" params={{ slug: c.slug }} className={buttonVariants({ className: "mt-10" })}>
                Shop now <ArrowRight />
              </Link>
            </Reveal>
          </article>
        ))}
      </div>
    </>
  );
}
