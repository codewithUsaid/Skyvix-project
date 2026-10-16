import { queryOptions } from "@tanstack/react-query";
import { listDbProducts, listDbCategories } from "./catalog.functions";

export const dbProductsQuery = queryOptions({
  queryKey: ["db-products"],
  queryFn: () => listDbProducts(),
  staleTime: 30_000,
});

export const dbCategoriesQuery = queryOptions({
  queryKey: ["db-categories"],
  queryFn: () => listDbCategories(),
  staleTime: 5 * 60_000,
});
