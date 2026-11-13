export interface Colour {
  name: string;
  hex: string;
}

export interface Category {
  slug: string;
  name: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  imageUrl: string;
  isSample: boolean;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  collectionId: string | null;
  pricePence: number;
  salePricePence: number | null;
  currency: string;
  images: string[];
  colours: Colour[];
  sizes: string[];
  isBestseller: boolean;
  isNew: boolean;
  isSample: boolean;
  createdAt: string;
}

export interface Variant {
  id: string;
  size: string;
  colour: string;
  stock: number;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  details: string[];
  care: string[];
  variants: Variant[];
}

export type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

export function effectivePrice(p: Pick<ProductSummary, "pricePence" | "salePricePence">) {
  return p.salePricePence ?? p.pricePence;
}
