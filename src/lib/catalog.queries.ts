import { queryOptions } from "@tanstack/react-query";
import { getCollection, getProduct, listCategories, listCollections, listProducts } from "./catalog.functions";
import type { SortOption } from "./catalog-types";

export interface ProductFilters {
  category?: string;
  collection?: string;
  sort?: SortOption;
  bestsellers?: boolean;
  search?: string;
  limit?: number;
}

export const categoriesQuery = () =>
  queryOptions({ queryKey: ["categories"], queryFn: () => listCategories(), staleTime: 5 * 60_000 });

export const collectionsQuery = () =>
  queryOptions({ queryKey: ["collections"], queryFn: () => listCollections(), staleTime: 5 * 60_000 });

export const productsQuery = (filters: ProductFilters = {}) =>
  queryOptions({
    queryKey: ["products", filters],
    queryFn: () => listProducts({ data: filters }),
    staleTime: 60_000,
  });

export const collectionQuery = (slug: string) =>
  queryOptions({ queryKey: ["collection", slug], queryFn: () => getCollection({ data: { slug } }), staleTime: 60_000 });

export const productQuery = (slug: string) =>
  queryOptions({ queryKey: ["product", slug], queryFn: () => getProduct({ data: { slug } }), staleTime: 60_000 });
