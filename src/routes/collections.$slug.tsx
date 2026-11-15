import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { collectionQuery } from "@/lib/catalog.queries";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal, Stagger, staggerItem } from "@/components/site/Reveal";
import { OceanWaves } from "@/components/site/FloatingShells";
import { SampleNotice } from "@/components/site/SampleBadge";

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(collectionQuery(params.slug)),
  head: ({ loaderData }) => {
    const c = loaderData?.collection;
    const title = c ? `${c.name} — SAF SWIM BY SUMMER` : "Collection — SAF SWIM BY SUMMER";
    const description = c?.description ?? "A SAF SWIM collection.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CollectionPage,
  notFoundComponent: () => (
    <div className="py-40 text-center">
      <p className="font-serif text-4xl">This collection has drifted away</p>
      <Link to="/collections" className="link-luxe eyebrow mt-8 inline-block">See all collections</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="py-40 text-center">
      <p className="font-serif text-4xl">This collection couldn't be loaded</p>
      <Link to="/collections" className="link-luxe eyebrow mt-8 inline-block">See all collections</Link>
    </div>
  ),
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(collectionQuery(slug));
  const { collection, products } = data;
  return (
    <>
      <section className="relative h-[85svh] min-h-[560px] overflow-hidden bg-ocean-night text-ivory">
        <img src={collection.imageUrl} alt={collection.name} className="absolute inset-0 h-full w-full object-cover object-top animate-ken-burns" width={1024} height={1344} />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-end px-6 pb-28 md:px-10">
          <Reveal>
            <p className="eyebrow text-sand">{collection.tagline}</p>
            <h1 className="display-xl mt-4">{collection.name}</h1>
            <p className="mt-6 max-w-xl text-lg text-ivory/85">{collection.description}</p>
          </Reveal>
        </div>
        <OceanWaves />
      </section>
      <section className="mx-auto max-w-[1500px] px-6 py-20 md:px-10 md:py-28">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="eyebrow text-muted-foreground">{products.length} pieces in this collection</p>
          <SampleNotice />
        </div>
        {products.length === 0 ? (
          <p className="py-20 text-center font-serif text-3xl">Pieces for this collection are coming soon.</p>
        ) : (
          <Stagger className="grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <motion.div key={p.id} variants={staggerItem}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </Stagger>
        )}
      </section>
    </>
  );
}
