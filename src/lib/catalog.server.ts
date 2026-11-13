import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Colour, Collection, ProductSummary } from "./catalog-types";

/** Read-only client for public catalogue data (RLS: published rows only). */
export function createPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CollectionRow = Database["public"]["Tables"]["collections"]["Row"];

export const PRODUCT_SUMMARY_COLUMNS =
  "id, slug, name, category_slug, collection_id, price_pence, sale_price_pence, currency, images, colours, sizes, is_bestseller, is_new, is_sample, created_at";

export function toProductSummary(
  r: Pick<
    ProductRow,
    | "id" | "slug" | "name" | "category_slug" | "collection_id" | "price_pence" | "sale_price_pence"
    | "currency" | "images" | "colours" | "sizes" | "is_bestseller" | "is_new" | "is_sample" | "created_at"
  >,
): ProductSummary {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    categorySlug: r.category_slug,
    collectionId: r.collection_id,
    pricePence: r.price_pence,
    salePricePence: r.sale_price_pence,
    currency: r.currency,
    images: r.images ?? [],
    colours: (Array.isArray(r.colours) ? r.colours : []) as unknown as Colour[],
    sizes: r.sizes ?? [],
    isBestseller: r.is_bestseller,
    isNew: r.is_new,
    isSample: r.is_sample,
    createdAt: r.created_at,
  };
}

export function toCollection(r: CollectionRow): Collection {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    description: r.description,
    imageUrl: r.image_url,
    isSample: r.is_sample,
  };
}
