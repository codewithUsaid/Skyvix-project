import { createServerFn } from "@tanstack/react-start";
import { publicClient, PRODUCT_COLUMNS } from "./catalog.server";
import { mapDbProduct, type DbProductRow } from "./catalog-map";

export const listDbProducts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return { products: [], error: error.message };
  return { products: ((data ?? []) as unknown as DbProductRow[]).map(mapDbProduct), error: null as string | null };
});

export const listDbCategories = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, icon, image_url, sort_order")
    .order("sort_order");
  if (error) return { categories: [] };
  return { categories: data ?? [] };
});

export const getStoreSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
  return { settings: data ?? null };
});
