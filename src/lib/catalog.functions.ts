import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import { createPublicClient, PRODUCT_SUMMARY_COLUMNS, toCollection, toProductSummary } from "./catalog.server";
import { effectivePrice, type Category, type Collection, type ProductDetail, type ProductSummary } from "./catalog-types";

export const listCategories = createServerFn({ method: "GET" }).handler(async (): Promise<Category[]> => {
  const sb = createPublicClient();
  const { data, error } = await sb.from("categories").select("slug, name").order("sort_order");
  if (error) throw new Error("Could not load categories");
  return data ?? [];
});

export const listCollections = createServerFn({ method: "GET" }).handler(async (): Promise<Collection[]> => {
  const sb = createPublicClient();
  const { data, error } = await sb.from("collections").select("*").order("sort_order");
  if (error) throw new Error("Could not load collections");
  return (data ?? []).map(toCollection);
});

const listSchema = z.object({
  category: z.string().max(60).optional(),
  collection: z.string().max(80).optional(),
  sort: z.enum(["featured", "newest", "price-asc", "price-desc"]).optional(),
  bestsellers: z.boolean().optional(),
  search: z.string().max(80).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const listProducts = createServerFn({ method: "GET" })
  .validator((input: z.input<typeof listSchema>) => listSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<ProductSummary[]> => {
    const sb = createPublicClient();
    let q = sb.from("products").select(PRODUCT_SUMMARY_COLUMNS);
    if (data.category) q = q.eq("category_slug", data.category);
    if (data.bestsellers) q = q.eq("is_bestseller", true);
    if (data.search) q = q.ilike("name", `%${data.search.replace(/[%_]/g, "")}%`);
    if (data.collection) {
      const { data: col } = await sb.from("collections").select("id").eq("slug", data.collection).maybeSingle();
      if (!col) return [];
      q = q.eq("collection_id", col.id);
    }
    q = q.order("created_at", { ascending: false });
    if (data.limit) q = q.limit(data.limit);
    const { data: rows, error } = await q;
    if (error) throw new Error("Could not load products");
    const products = (rows ?? []).map(toProductSummary);
    switch (data.sort) {
      case "price-asc":
        return products.sort((a, b) => effectivePrice(a) - effectivePrice(b));
      case "price-desc":
        return products.sort((a, b) => effectivePrice(b) - effectivePrice(a));
      case "newest":
        return products;
      default:
        return products.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));
    }
  });

export const getCollection = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => z.object({ slug: z.string().max(80) }).parse(input))
  .handler(async ({ data }) => {
    const sb = createPublicClient();
    const { data: row, error } = await sb.from("collections").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error("Could not load collection");
    if (!row) throw notFound();
    const { data: products } = await sb
      .from("products")
      .select(PRODUCT_SUMMARY_COLUMNS)
      .eq("collection_id", row.id)
      .order("created_at", { ascending: false });
    return { collection: toCollection(row), products: (products ?? []).map(toProductSummary) };
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => z.object({ slug: z.string().max(80) }).parse(input))
  .handler(async ({ data }) => {
    const sb = createPublicClient();
    const { data: row, error } = await sb.from("products").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error("Could not load product");
    if (!row) throw notFound();
    const { data: variants } = await sb
      .from("product_variants")
      .select("id, size, colour, stock")
      .eq("product_id", row.id);
    const product: ProductDetail = {
      ...toProductSummary(row),
      description: row.description,
      details: row.details ?? [],
      care: row.care ?? [],
      variants: variants ?? [],
    };
    let collection: Collection | null = null;
    if (row.collection_id) {
      const { data: c } = await sb.from("collections").select("*").eq("id", row.collection_id).maybeSingle();
      collection = c ? toCollection(c) : null;
    }
    const { data: relatedRows } = await sb
      .from("products")
      .select(PRODUCT_SUMMARY_COLUMNS)
      .neq("id", row.id)
      .or(`category_slug.eq.${row.category_slug}${row.collection_id ? `,collection_id.eq.${row.collection_id}` : ""}`)
      .limit(4);
    let related = (relatedRows ?? []).map(toProductSummary);
    if (related.length < 4) {
      const { data: more } = await sb
        .from("products")
        .select(PRODUCT_SUMMARY_COLUMNS)
        .neq("id", row.id)
        .limit(8);
      const seen = new Set(related.map((p) => p.id));
      related = [...related, ...(more ?? []).map(toProductSummary).filter((p) => !seen.has(p.id))].slice(0, 4);
    }
    return { product, collection, related };
  });
